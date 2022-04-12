import preprocess from "svelte-preprocess";
import path from 'path'
import adapter from "@sveltejs/adapter-static";
//import node from "@sveltejs/adapter-node";

const dev = process.env.NODE_ENV == "development"

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {

    //adapter: node()
    adapter: adapter(),
    files: {
      lib: './src/lib'
    },
    prerender: {
        default: true
    },

    vite: {
      resolve: {
        alias: {
          $lib: path.resolve('./src/lib')
        }
      },
      compilerOptions: { dev },
    }
  },

  preprocess: preprocess(),
}

export default config