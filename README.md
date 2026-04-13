# Clinic Voice Demo (Москва)

Быстрый демо-проект голосового помощника для сети клиник «Будь здоров» (город Москва).

Экстренная травма направляется в травмпункт на Сретенке. Во всех остальных филиалах помощь оказывается планово.

## Что умеет

- Ведет диалог голосом и текстом на сайте.
- Уточняет симптомы.
- Распознает реплики через Yandex SpeechKit STT, без браузерного `SpeechRecognition`.
- Определяет профиль врача по жалобам через YandexGPT (нейросеть), а не по простым правилам.
- Учитывает район и желаемое время.
- Подбирает подходящий филиал и адрес.
- Создает подтвержденную запись только после явного подтверждения контакта.
- Озвучка через Yandex Neural.

## Запуск с Yandex Neural

1. Создайте файл `.env` рядом с `server.js`:

```bash
YANDEX_API_KEY=ваш_api_key
YANDEX_FOLDER_ID=ваш_folder_id
YANDEX_GPT_MODEL_URI=gpt://<ваш_folder_id>/yandexgpt/latest
PORT=8080
```

2. Запустите сервер:

```bash
cd /Users/anastasia/clinic-voice-demo
node server.js
```

3. Откройте: `http://localhost:8080`

## Важно

- Микрофон работает на `localhost`.
- Для SpeechKit STT у сервисного аккаунта нужны роль `ai.speechkit-stt.user` и scope ключа `yc.ai.speechkitStt.execute`.
- Это демонстрационный сценарий маршрутизации, не медицинская диагностика.

## Кастомизация

- Филиалы, адреса, врачи и слоты редактируются в `app.js` в массиве `clinics`.
- Классификация профиля выполняется на сервере через endpoint `/api/specialty/classify` в `server.js`.
- Список голосов Yandex меняется в `app.js` в массиве `yandexVoices`.

## Деплой на домен

Этот проект не подходит для простого статического хостинга, потому что у него есть серверная часть на Node.js и секретные ключи Yandex в `.env`.

Нужна схема:

1. Linux-сервер или VPS
2. `Node.js 18+`
3. `pm2`
4. `nginx`
5. домен, направленный на IP сервера
6. SSL через Let's Encrypt

Подготовленные файлы:

- PM2-конфиг: `ecosystem.config.cjs`
- Nginx-шаблон: `deploy/nginx-clinic-voice-demo.conf`

### Размещение приложения на сервере

```bash
sudo mkdir -p /var/www/clinic-voice-demo
sudo chown -R $USER:$USER /var/www/clinic-voice-demo
cd /var/www/clinic-voice-demo
mkdir -p current
```

Загрузите файлы проекта в `/var/www/clinic-voice-demo/current`, затем:

```bash
cd /var/www/clinic-voice-demo/current
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Nginx

Скопируйте шаблон и замените `example.ru` / `www.example.ru` на ваш домен:

```bash
sudo cp deploy/nginx-clinic-voice-demo.conf /etc/nginx/sites-available/clinic-voice-demo.conf
sudo ln -s /etc/nginx/sites-available/clinic-voice-demo.conf /etc/nginx/sites-enabled/clinic-voice-demo.conf
sudo nginx -t
sudo systemctl reload nginx
```

### SSL

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.ru -d www.example.ru
```
