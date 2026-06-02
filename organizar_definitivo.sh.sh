#!/bin/bash

# RUTAS ABSOLUTAS
DESTINO="/c/Users/naile/OneDrive/Documentos/visuallogic_alro_workspace"
ORIGEN="/c/Users/naile/OneDrive/Documentos/alro/codigo"
BUFFER="/c/Users/naile/OneDrive/Documentos/archivos_sucios"

# 1. Asegurar que las carpetas existan ANTES de mover nada
echo "Creando estructura de directorios..."
mkdir -p "$DESTINO/force-app/main/default/lwc/alroDashboardMaster"
mkdir -p "$DESTINO/docs"
mkdir -p "$BUFFER"

echo "--- Iniciando migración real ---"

# Función de movimiento verificado
mover_con_verificacion() {
    local archivo=$1
    local carpeta_destino=$2
    
    if [ -f "$archivo" ]; then
        local base=$(basename "$archivo")
        # Renombrado inteligente
        local nuevo_nombre=$(grep -m 1 -E -o '(class|function)\s+\w+' "$archivo" | awk '{print $2}')
        if [ -z "$nuevo_nombre" ]; then nuevo_nombre=$(echo "$base" | cut -f 1 -d '.'); fi
        local ext="${base##*.}"
        
        # Mover
        mv "$archivo" "$DESTINO/$carpeta_destino/$nuevo_nombre.$ext"
        
        if [ $? -eq 0 ]; then
            echo "[OK] Movido: $base -> $nuevo_nombre.$ext"
        else
            echo "[ERROR] Falló al mover $base"
        fi
    fi
}

# 2. Procesar archivos
for f in "$ORIGEN"/*.js; do mover_con_verificacion "$f" "force-app/main/default/lwc/alroDashboardMaster"; done
for f in "$ORIGEN"/*.html; do mover_con_verificacion "$f" "force-app/main/default/lwc/alroDashboardMaster"; done
for f in "$ORIGEN"/*.md; do mv "$f" "$DESTINO/docs/" 2>/dev/null; done
for f in "$ORIGEN"/*.docx; do mv "$f" "$DESTINO/docs/" 2>/dev/null; done

echo "--- Proceso terminado, mami i ---"