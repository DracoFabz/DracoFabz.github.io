import http.server
import socketserver
import os

# Ruta del directorio que quieres servir
directorio = r"C:\Users\fabri\OneDrive\Documentos\GitHub Repositories\DracoFabz"
os.chdir(directorio)  # Cambia el directorio actual al que especificaste

# Configuramos el puerto
puerto = 8000  # Cambia el puerto si es necesario

# Configuración del servidor
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", puerto), Handler) as httpd:
    print(f"Servidor corriendo en http://localhost:{puerto}")
    print(f"Sirviendo archivos desde: {directorio}")
    httpd.serve_forever()
