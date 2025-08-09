namespace CoolingManagerAPI.Middleware;

public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Security headers
        context.Response.Headers.Add("X-Frame-Options", "DENY");
        context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
        context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");
        
        // HSTS header for HTTPS
        if (context.Request.IsHttps)
        {
            context.Response.Headers.Add("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        }

        // Content Security Policy
        var csp = "default-src 'self'; " +
                  "connect-src 'self' https://api.coolingmanager.com wss://api.coolingmanager.com; " +
                  "img-src 'self' data: https:; " +
                  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                  "font-src 'self' https://fonts.gstatic.com; " +
                  "script-src 'self'; " +
                  "object-src 'none'; " +
                  "base-uri 'self'; " +
                  "form-action 'self';";
        
        context.Response.Headers.Add("Content-Security-Policy", csp);

        await _next(context);
    }
}
