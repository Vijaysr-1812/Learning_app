# Optional development preview. The application itself needs no server.
# Bind only to loopback and serve an explicit allowlist; never expose arbitrary files.
param([int]$Port = 8765)
$appRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$allowed = @('index.html','styles.css','curriculum.js','ai.js','dsa.js','system.js','sql.js','app.js','tests.html','tests.js')
$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Parse('127.0.0.1'), $Port)
$listener.Start()
Write-Output "Commonplace preview: http://127.0.0.1:$Port"
try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $client.ReceiveTimeout = 5000
      $stream = $client.GetStream()
      $reader = [IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 1024, $true)
      $request = $reader.ReadLine()
      if (-not $request) { continue }
      while ($reader.ReadLine()) {}
      $pieces = $request.Split(' ')
      $method = $pieces[0]
      $requested = [Uri]::UnescapeDataString(($pieces[1].Split('?')[0])).TrimStart('/')
      if ($requested -eq '') { $requested = 'index.html' }
      if (($method -eq 'GET' -or $method -eq 'HEAD') -and $allowed -contains $requested) {
        $filePath = Join-Path $appRoot $requested
        if (Test-Path -LiteralPath $filePath -PathType Leaf) {
          $body = [IO.File]::ReadAllBytes($filePath)
          $type = switch ([IO.Path]::GetExtension($filePath)) { '.css' {'text/css'} '.js' {'text/javascript'} default {'text/html'} }
          $status = '200 OK'
        } else { $body = [Text.Encoding]::UTF8.GetBytes('Not found'); $status = '404 Not Found'; $type = 'text/plain' }
      } else { $body = [Text.Encoding]::UTF8.GetBytes('Not found'); $status = '404 Not Found'; $type = 'text/plain' }
      $header = [Text.Encoding]::ASCII.GetBytes("HTTP/1.1 $status`r`nContent-Type: $type; charset=utf-8`r`nContent-Length: $($body.Length)`r`nCache-Control: no-store`r`nX-Content-Type-Options: nosniff`r`nConnection: close`r`n`r`n")
      $stream.Write($header, 0, $header.Length)
      if ($method -ne 'HEAD') { $stream.Write($body, 0, $body.Length) }
      $stream.Flush()
    } catch { Write-Warning $_.Exception.Message }
    finally { $client.Close() }
  }
} finally { $listener.Stop() }
