# ocho de marzo 2016 @eldiarioes


## Requisitos, dependencias y otros aquí

Para compilar el proyecto se requiere NodeJs y sus módulos correspondientes. Sin embargo, está diseñado para que el proyecto se ejecute directamente en su carpeta, sin mayores requisitos que un servidor Apache suficientemente actualizado.

## Componentes
PHP:
  - composer
  - Silex
  - twig
nodeJS:
  - NPM
  - Grunt
Ruby
  - Sass
Apache
  - modrewrite

## Características del proyecto

El proyecto incluye 4 tareas **grunt** configiuradas:

- **watch**: tarea para el procesado dinámico de los scsss
- **sass**: Como el anterior, pero solo se ejecuta una vez
- **compile**: genera la versión de producción del proyecto (sin imágenes)
- **compileimg**: genera la versión de producción del proyecto (con imágenes)

##Instalación
```bash
  npm install
  php composer.phar install
  grunt sass
```

```
#!python