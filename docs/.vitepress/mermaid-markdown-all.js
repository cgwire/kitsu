const MermaidExample = (md) => {
  const defaultRenderer = md.renderer.rules.fence;

  if (!defaultRenderer) {
    throw new Error("defaultRenderer is undefined");
  }

  md.renderer.rules.fence = (tokens, index, options, env, slf) => {
    const token = tokens[index];
    const language = token.info.trim();
    if (language.startsWith("mermaid")) {
      const key = index;
      return `
      <Suspense>
      <template #default>
      <Mermaid id="mermaid-${key}" :showCode="${
        language === "mermaid-example"
      }" graph="${encodeURIComponent(token.content)}"></Mermaid>
      </template>
        <!-- loading state via #fallback slot -->
        <template #fallback>
          Loading...
        </template>
      </Suspense>
`;
    }

    return defaultRenderer(tokens, index, options, env, slf);
  };
};

export default MermaidExample;
