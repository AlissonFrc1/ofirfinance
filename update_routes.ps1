# Diretório base
$BaseDir = "d:/Projeto/Ofir-Fin/src/app/api"

# Função para atualizar rotas
function Update-Route {
    param([string]$FilePath)
    
    Write-Host "Processando $FilePath"
    
    # Verificar se o arquivo existe
    if (-not (Test-Path $FilePath)) {
        Write-Warning "Arquivo não encontrado: $FilePath"
        return
    }
    
    # Ler o conteúdo do arquivo
    $content = Get-Content $FilePath
    
    # Adicionar dynamic se não existir
    $newContent = @("export const dynamic = 'force-dynamic';") + $content
    
    # Remover config antigo
    $newContent = $newContent | Where-Object { 
        $_ -notmatch "export const config = {" -and 
        $_ -notmatch "^}"
    }
    
    # Substituir o conteúdo do arquivo
    $newContent | Set-Content $FilePath
}

# Encontrar todos os arquivos route.ts
Get-ChildItem -Path $BaseDir -Recurse -Filter "route.ts" | ForEach-Object {
    Update-Route -FilePath $_.FullName
}

Write-Host "Atualização concluída!"
