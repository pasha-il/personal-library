# Личная Библиотека

Простой прототип приложения для управления личной библиотекой на React и TypeScript.

## Возможности
- Виртуализованный список книг.
- Фильтрация и сортировка с мемоизацией.
- Поиск с дебаунсом и загрузкой данных из Google Books API.
- Добавление книг через модальное окно и оптимистичное сохранение в IndexedDB (Dexie).
- Вспомогательные утилиты для работы с обложками Open Library.

## Быстрый старт
```
npm install
npm test # в проекте пока нет тестов
```

## Структура
- `src/types.ts` – типы данных.
- `src/filter.ts` – функции фильтрации и сортировки.
- `src/hooks.ts` – хуки `useDebounce`, `useExternalSearch` и запрос к Google Books.
- `src/db.ts` – конфигурация IndexedDB через Dexie.
- `src/external.ts` – получение обложек Open Library.
- `src/components/` – компоненты UI (`BookList`, `AddBookModal`).
