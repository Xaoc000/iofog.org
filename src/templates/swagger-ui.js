class SwaggerUI extends HTMLElement {
  async connectedCallback() {
    const [{ default: SwaggerUI }] = await Promise.all([
      import('swagger-ui'),
      import('swagger-ui/dist/swagger-ui.css')
    ]);
    // This isn't ideal, getting the version number from the URL like this.
    // I'm not sure of any alternative that isn't much more complex.
    const match = location.pathname.match(/^\/docs\/([^/]*)\//);
    if (!match) throw new Error('No swagger definition found');
    // We want to look up the latest patch version, since the docs will always
    // just have X.x.0 (zero patch)
    const version = match[1].replace(/^([0-9]\.[0-9])\.[0-9]$/, '$1.x');

    SwaggerUI({
      domNode: this,
      url: `https://unpkg.com/iofogcontroller@${version}/specs/swagger.yml`
    });
  }
}

customElements.define('swagger-ui', SwaggerUI);
