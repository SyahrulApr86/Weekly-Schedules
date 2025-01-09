# Menggunakan image Node.js sebagai base image untuk tahap build
FROM node:18-alpine AS build

# Menentukan direktori kerja di dalam container
WORKDIR /app

# Menyalin file package.json dan package-lock.json ke dalam container
COPY package*.json ./

# Menginstal dependensi aplikasi
RUN npm install

# Menyalin semua file proyek ke dalam container
COPY . .

# Build aplikasi untuk produksi
RUN npm run build

# Menggunakan image Nginx untuk menyajikan aplikasi
FROM nginx:alpine

# Menyalin hasil build dari tahap sebelumnya ke direktori Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Mengekspos port 80 agar aplikasi dapat diakses
EXPOSE 80

# Menjalankan Nginx
CMD ["nginx", "-g", "daemon off;"]
