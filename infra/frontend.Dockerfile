FROM node:20-alpine AS build
WORKDIR /app
COPY digital-lab/frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm ci && npm run build || (echo "Build failed" && exit 1)
# Pack build or dist into tar for flexible copy
RUN if [ -d build ]; then tar -C build -cf /tmp/app.tar .; elif [ -d dist ]; then tar -C dist -cf /tmp/app.tar .; else mkdir -p /tmp && tar -cf /tmp/app.tar --files-from /dev/null; fi

FROM nginx:alpine
COPY infra/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /tmp/app.tar /tmp/app.tar
RUN mkdir -p /usr/share/nginx/html && tar -C /usr/share/nginx/html -xf /tmp/app.tar || true

