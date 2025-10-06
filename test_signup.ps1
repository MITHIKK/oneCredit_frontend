$signupData = @{
    name = "Test User"
    email = "testuser@example.com"
    phone = "9876543210"
    username = "testuser123"
    password = "password123"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "Testing signup endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/signup" `
        -Method POST `
        -Body $signupData `
        -Headers $headers `
        -ContentType "application/json"
    
    Write-Host "✅ Signup successful!" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Signup failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Yellow
    }
}
