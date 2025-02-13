# Script para atualizar rotas

$baseDir = 'd:/Projeto/Ofir-Fin/src/app/api'

# Encontrar todos os arquivos route.ts
$files = Get-ChildItem -Path $baseDir -Recurse -Filter 'route.ts' | Where-Object { $_.FullName -notmatch '\[.*\]' }

foreach ($file in $files) {
    Write-Host "Processando $($file.FullName)"
    
    try {
        # Ler o conteúdo do arquivo
        $content = Get-Content $file.FullName -Raw
        
        # Adicionar dynamic no início
        $newContent = "export const dynamic = 'force-dynamic';" + [Environment]::NewLine + $content
        
        # Remover config antigo
        $newContent = $newContent -replace "export const config = {[\s\S]*?};", ""
        
        # Substituir o conteúdo do arquivo
        $newContent | Set-Content $file.FullName -Encoding UTF8
    }
    catch {
        Write-Warning "Erro ao processar $($file.FullName): $_"
    }
}

Write-Host "Atualização concluída!"
