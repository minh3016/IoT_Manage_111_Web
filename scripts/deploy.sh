#!/bin/bash

# =============================================================================
# COOLING MANAGER IOT - PRODUCTION DEPLOYMENT SCRIPT
# =============================================================================
# Deploy the Cooling Manager IoT application to production
# Domain: iotmanage111.xyz
# 
# Usage: ./scripts/deploy.sh [environment]
# Example: ./scripts/deploy.sh production
# =============================================================================

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${1:-production}"
COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_user() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root for security reasons"
        log_info "Please run as the deploy user: su - deploy"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if environment file exists
    if [[ ! -f "$PROJECT_DIR/$ENV_FILE" ]]; then
        log_error "Environment file $ENV_FILE not found!"
        log_info "Please copy .env.production.example to $ENV_FILE and configure it."
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running. Please start Docker service."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Load environment variables
load_environment() {
    log_info "Loading environment variables..."
    
    if [[ -f "$PROJECT_DIR/$ENV_FILE" ]]; then
        set -a  # Automatically export all variables
        source "$PROJECT_DIR/$ENV_FILE"
        set +a
        log_success "Environment variables loaded"
    else
        log_error "Environment file $ENV_FILE not found"
        exit 1
    fi
}

# Validate environment configuration
validate_environment() {
    log_info "Validating environment configuration..."
    
    # Check required variables
    required_vars=(
        "POSTGRES_PASSWORD"
        "REDIS_PASSWORD"
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
        "DOMAIN"
        "API_DOMAIN"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
        
        # Check if still using default/placeholder values
        if [[ "${!var}" == *"CHANGE_THIS"* ]]; then
            log_error "Environment variable $var still contains placeholder value"
            log_info "Please update $ENV_FILE with secure values"
            exit 1
        fi
    done
    
    # Validate password lengths
    if [[ ${#POSTGRES_PASSWORD} -lt 16 ]]; then
        log_error "POSTGRES_PASSWORD must be at least 16 characters long"
        exit 1
    fi
    
    if [[ ${#JWT_SECRET} -lt 32 ]]; then
        log_error "JWT_SECRET must be at least 32 characters long"
        exit 1
    fi
    
    log_success "Environment validation passed"
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    
    directories=(
        "$PROJECT_DIR/logs"
        "$PROJECT_DIR/backups"
        "$PROJECT_DIR/nginx/logs"
        "$PROJECT_DIR/ssl"
    )
    
    for dir in "${directories[@]}"; do
        if [[ ! -d "$dir" ]]; then
            mkdir -p "$dir"
            log_info "Created directory: $dir"
        fi
    done
    
    log_success "Directories created"
}

# Backup existing data
backup_data() {
    log_info "Creating backup of existing data..."
    
    BACKUP_DIR="$PROJECT_DIR/backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup database if container exists
    if docker ps -a --format 'table {{.Names}}' | grep -q "cooling_postgres"; then
        log_info "Backing up database..."
        docker exec cooling_postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$BACKUP_DIR/database.sql"
        gzip "$BACKUP_DIR/database.sql"
        log_success "Database backup created: $BACKUP_DIR/database.sql.gz"
    fi
    
    # Backup environment file
    if [[ -f "$PROJECT_DIR/$ENV_FILE" ]]; then
        cp "$PROJECT_DIR/$ENV_FILE" "$BACKUP_DIR/env.backup"
        log_success "Environment backup created"
    fi
    
    log_success "Backup completed: $BACKUP_DIR"
}

# Pull latest code
update_code() {
    log_info "Updating application code..."
    
    cd "$PROJECT_DIR"
    
    # Stash any local changes
    if git status --porcelain | grep -q .; then
        log_warning "Local changes detected, stashing..."
        git stash push -m "Auto-stash before deployment $(date)"
    fi
    
    # Pull latest changes
    git fetch origin
    git checkout production
    git pull origin production
    
    log_success "Code updated successfully"
}

# Build and deploy containers
deploy_containers() {
    log_info "Building and deploying containers..."
    
    cd "$PROJECT_DIR"
    
    # Stop existing containers
    if docker-compose -f "$COMPOSE_FILE" ps -q | grep -q .; then
        log_info "Stopping existing containers..."
        docker-compose -f "$COMPOSE_FILE" down
    fi
    
    # Build and start containers
    log_info "Building containers..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    log_info "Starting containers..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    log_success "Containers deployed successfully"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Wait for database to be ready
    log_info "Waiting for database to be ready..."
    sleep 30
    
    # Run migrations
    docker-compose -f "$COMPOSE_FILE" exec -T backend npm run db:migrate
    
    # Seed production data if needed
    if [[ "$2" == "--seed" ]]; then
        log_info "Seeding production data..."
        docker-compose -f "$COMPOSE_FILE" exec -T backend npm run db:seed:prod
    fi
    
    log_success "Database migrations completed"
}

# Health checks
perform_health_checks() {
    log_info "Performing health checks..."
    
    # Wait for services to start
    sleep 60
    
    # Check container status
    if ! docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        log_error "Some containers are not running properly"
        docker-compose -f "$COMPOSE_FILE" ps
        exit 1
    fi
    
    # Check application health
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log_info "Health check attempt $attempt/$max_attempts..."
        
        # Check backend health
        if curl -f -s "http://localhost:5000/health" > /dev/null; then
            log_success "Backend health check passed"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            log_error "Health checks failed after $max_attempts attempts"
            log_info "Checking container logs..."
            docker-compose -f "$COMPOSE_FILE" logs --tail=50
            exit 1
        fi
        
        sleep 10
        ((attempt++))
    done
    
    log_success "All health checks passed"
}

# Setup SSL certificates
setup_ssl() {
    log_info "Setting up SSL certificates..."
    
    # Check if certificates already exist
    if [[ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]]; then
        log_info "SSL certificates already exist"
        return 0
    fi
    
    log_info "SSL certificates need to be obtained manually"
    log_info "Please run the following commands as root:"
    echo ""
    echo "sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN -d $API_DOMAIN"
    echo "sudo systemctl enable certbot.timer"
    echo ""
    log_warning "SSL setup requires manual intervention"
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Create health check script
    cat > "$PROJECT_DIR/scripts/health-check.sh" << 'EOF'
#!/bin/bash
DOMAIN="iotmanage111.xyz"
API_DOMAIN="api.iotmanage111.xyz"
LOG_FILE="/var/log/cooling-manager-health.log"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Check frontend
if curl -f -s "https://$DOMAIN" > /dev/null; then
    log "Frontend: OK"
else
    log "Frontend: FAILED"
fi

# Check API
if curl -f -s "https://$API_DOMAIN/health" > /dev/null; then
    log "API: OK"
else
    log "API: FAILED"
fi
EOF
    
    chmod +x "$PROJECT_DIR/scripts/health-check.sh"
    
    log_success "Monitoring setup completed"
}

# Cleanup old resources
cleanup() {
    log_info "Cleaning up old resources..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove old backups (keep last 10)
    if [[ -d "$PROJECT_DIR/backups" ]]; then
        cd "$PROJECT_DIR/backups"
        ls -t | tail -n +11 | xargs -r rm -rf
    fi
    
    log_success "Cleanup completed"
}

# Display deployment summary
show_summary() {
    log_success "🎉 Deployment completed successfully!"
    echo ""
    echo "==============================================================================="
    echo "                        DEPLOYMENT SUMMARY"
    echo "==============================================================================="
    echo "Environment: $ENVIRONMENT"
    echo "Domain: https://$DOMAIN"
    echo "API: https://$API_DOMAIN"
    echo "Deployment Time: $(date)"
    echo ""
    echo "Services Status:"
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    echo "Next Steps:"
    echo "1. Configure SSL certificates if not already done"
    echo "2. Set up monitoring and alerting"
    echo "3. Configure backups"
    echo "4. Test all application functionality"
    echo "5. Update DNS records if needed"
    echo ""
    echo "Useful Commands:"
    echo "- View logs: docker-compose -f $COMPOSE_FILE logs -f"
    echo "- Restart services: docker-compose -f $COMPOSE_FILE restart"
    echo "- Update application: ./scripts/deploy.sh production"
    echo "==============================================================================="
}

# Main deployment function
main() {
    log_info "Starting deployment to $ENVIRONMENT environment..."
    
    check_user
    check_prerequisites
    load_environment
    validate_environment
    create_directories
    backup_data
    update_code
    deploy_containers
    run_migrations "$@"
    perform_health_checks
    setup_ssl
    setup_monitoring
    cleanup
    show_summary
    
    log_success "Deployment completed successfully! 🚀"
}

# Error handling
trap 'log_error "Deployment failed at line $LINENO. Exit code: $?"' ERR

# Run main function
main "$@"
