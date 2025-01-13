## Clase de Docker

Aplicacion en Node.JS, que tenga las siguientes funcionalidades:

- [X] Subir ficheros
- [X] Obtener ficheros subidos
- [X] Crear usuarios
    + Usuario/Password
- [ ] Autenticar usuarios
- [X] Asignar permisos a los ficheros subidos


S3, Simple Storage Service de Amazon
MinIO - Open Source

```bash
docker run -p 9002:9002 -p 9003:9003 -v $PWD/minio-data:/data \
  quay.io/minio/minio server /data --address=":9002" --console-address ":9003"
```

Lanzar postgres base de datos
```bash
docker run -d \
    --name some-postgres \
    -p 5436:5432 \
    -e POSTGRES_PASSWORD=postgres \
    -e PGDATA=/var/lib/postgresql/data/pgdata \
    -v $PWD/postgres-data:/var/lib/postgresql/data \
    postgres:14.2-alpine
```

Lanzar portainer, dashboard de docker
```bash
docker volume create portainer_data

docker run -d -p 8000:8000 -p 9900:9000 -p 9443:9443 --name portainer \
    --restart=always \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v portainer_data:/data \
    portainer/portainer-ce:2.9.3

```

## Desplegar aplicacion

- [X] Construir un Dockerfile
- [X] Construir la imagen Docker
- [X] Probar imagen docker en local
- [X] Subir la imagen Docker a un registro de contenedores (Docker Hub, quay.io, ghcr.io)
- [X] Crear un cluster de Kubernetes
- [X] Desplegar contenedor en Kubernetes
- [X] Probar el servicio

Construir imagen:
```bash
docker build -t kfsoftware/curso-nodejs:1.0.1 .
```

Subir la imagen a docker hub:
```bash
docker push kfsoftware/curso-nodejs:1.0.1
```

Lanzar imagen:
```bash
docker run --rm --network host  --name curso-nodejs kfsoftware/curso-nodejs:1.0.1
```

## Instalar LENS

https://k8slens.dev/

## Desplegar cluster de Kubernetes

Instalar KinD: https://kind.sigs.k8s.io/

```bash
kind create cluster
```

```bash
kubectl create deployment curso --image=kfsoftware/curso-nodejs:1.0.1
```

Crear un servicio
```bash
kubectl expose deployment curso --port=80 --target-port=3000
```

Acceder al servicio
```bash
kubectl port-forward svc/curso 3002:80
```
