import alias from "@rollup/plugin-alias";

export default {
  // other configs
  plugins: [
    alias({
      entries: [
        { find: "querystring", replacement: false },
        { find: "url", replacement: false },
      ],
    }),
  ],
};
