using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace CoolingManagerAPI.Hubs;

[Authorize]
public class DeviceHub : Hub
{
    private readonly ILogger<DeviceHub> _logger;

    public DeviceHub(ILogger<DeviceHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        var connectionId = Context.ConnectionId;
        
        _logger.LogInformation("User {UserId} connected with connection {ConnectionId}", userId, connectionId);
        
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        var connectionId = Context.ConnectionId;
        
        _logger.LogInformation("User {UserId} disconnected with connection {ConnectionId}", userId, connectionId);
        
        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinDeviceGroup(int deviceId)
    {
        var groupName = $"Device_{deviceId}";
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        
        _logger.LogInformation("Connection {ConnectionId} joined group {GroupName}", 
            Context.ConnectionId, groupName);
    }

    public async Task LeaveDeviceGroup(int deviceId)
    {
        var groupName = $"Device_{deviceId}";
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        
        _logger.LogInformation("Connection {ConnectionId} left group {GroupName}", 
            Context.ConnectionId, groupName);
    }

    public async Task JoinAllDevicesGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "AllDevices");
        
        _logger.LogInformation("Connection {ConnectionId} joined AllDevices group", 
            Context.ConnectionId);
    }

    public async Task LeaveAllDevicesGroup()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "AllDevices");
        
        _logger.LogInformation("Connection {ConnectionId} left AllDevices group", 
            Context.ConnectionId);
    }
}

// Extension methods for sending messages to groups
public static class DeviceHubExtensions
{
    public static async Task SendDeviceDataUpdate(this IHubContext<DeviceHub> hubContext, 
        int deviceId, object data)
    {
        await hubContext.Clients.Group($"Device_{deviceId}")
            .SendAsync("DeviceDataUpdated", deviceId, data);
    }

    public static async Task SendGpioStateUpdate(this IHubContext<DeviceHub> hubContext, 
        int deviceId, object state)
    {
        await hubContext.Clients.Group($"Device_{deviceId}")
            .SendAsync("GpioStateUpdated", deviceId, state);
    }

    public static async Task SendDeviceStatusChange(this IHubContext<DeviceHub> hubContext, 
        int deviceId, string status)
    {
        await hubContext.Clients.Group($"Device_{deviceId}")
            .SendAsync("DeviceStatusChanged", deviceId, status);
        
        await hubContext.Clients.Group("AllDevices")
            .SendAsync("DeviceStatusChanged", deviceId, status);
    }

    public static async Task SendAlertTriggered(this IHubContext<DeviceHub> hubContext, 
        int deviceId, object alert)
    {
        await hubContext.Clients.Group($"Device_{deviceId}")
            .SendAsync("AlertTriggered", deviceId, alert);
        
        await hubContext.Clients.Group("AllDevices")
            .SendAsync("AlertTriggered", deviceId, alert);
    }
}
