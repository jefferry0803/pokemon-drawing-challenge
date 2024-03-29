# pokemon-drawing-challenge

![](./src/assets/pdc_logo.png)

<https://pokemon-drawing-challenge.web.app/>

## Introduction

Pokemon Drawing Challenge is a Pokemon drawing game. Players have to draw a random pokemon which generated by system in a minute. If you are an authenticated player, your paintings would be stored into database. You can check them out in your personal **Drawing History** page in any time, or share them to **Public Gallery**, then every user shall see your masterpieces!

This project was written with vue3 and vite and use pinia for state management. All the pokemon data is from [PokeApi](https://pokeapi.co/), and I use Firebase Firestore for authentication and storing data.

## Install

This template should help get you started developing with Vue 3 in Vite.

### Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

### Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

### Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
