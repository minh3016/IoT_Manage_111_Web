using System.Net;
using System.Text.Json;
using CoolingManagerAPI.Models;

namespace CoolingManagerAPI.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = exception switch
        {
            ArgumentException => new ApiResponse
            {
                Success = false,
                Error = "VALIDATION_ERROR",
                Message = exception.Message
            },
            UnauthorizedAccessException => new ApiResponse
            {
                Success = false,
                Error = "UNAUTHORIZED",
                Message = "Access denied"
            },
            KeyNotFoundException => new ApiResponse
            {
                Success = false,
                Error = "NOT_FOUND",
                Message = exception.Message
            },
            InvalidOperationException => new ApiResponse
            {
                Success = false,
                Error = "INVALID_OPERATION",
                Message = exception.Message
            },
            _ => new ApiResponse
            {
                Success = false,
                Error = "INTERNAL_ERROR",
                Message = "An internal server error occurred"
            }
        };

        context.Response.StatusCode = exception switch
        {
            ArgumentException => (int)HttpStatusCode.BadRequest,
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
            KeyNotFoundException => (int)HttpStatusCode.NotFound,
            InvalidOperationException => (int)HttpStatusCode.Conflict,
            _ => (int)HttpStatusCode.InternalServerError
        };

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}
