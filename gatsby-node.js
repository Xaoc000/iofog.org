const path = require("path");
const util = require("util");
const _ = require("lodash");
const moment = require("moment");
const { fmImagesToRelative } = require('gatsby-remark-relative-images');
const siteConfig = require("./data/SiteConfig");

/*
const postNodes = [];

function addSiblingNodes(createNodeField) {
  postNodes.sort(
    ({ frontmatter: { date: date1 } }, { frontmatter: { date: date2 } }) => {
      const dateA = moment(date1, siteConfig.dateFromFormat);
      const dateB = moment(date2, siteConfig.dateFromFormat);

      if (dateA.isBefore(dateB)) return 1;

      if (dateB.isBefore(dateA)) return -1;

      return 0;
    }
  );
  for (let i = 0; i < postNodes.length; i += 1) {
    const nextID = i + 1 < postNodes.length ? i + 1 : 0;
    const prevID = i - 1 > 0 ? i - 1 : postNodes.length - 1;
    const currNode = postNodes[i];
    const nextNode = postNodes[nextID];
    const prevNode = postNodes[prevID];
    createNodeField({
      node: currNode,
      name: "nextTitle",
      value: nextNode.frontmatter.title
    });
    createNodeField({
      node: currNode,
      name: "nextSlug",
      value: nextNode.fields.slug
    });
    createNodeField({
      node: currNode,
      name: "prevTitle",
      value: prevNode.frontmatter.title
    });
    createNodeField({
      node: currNode,
      name: "prevSlug",
      value: prevNode.fields.slug
    });
  }
}
*/
/*
exports.onCreateNode = ({ node, actions, getNode }) => {
  fmImagesToRelative(node);
  const { createNodeField } = actions;
  let slug;
  if (node.internal.type === "MarkdownRemark") {
    const fileNode = getNode(node.parent);
    const parsedFilePath = path.parse(fileNode.relativePath);
    if (parsedFilePath.name !== "index" && parsedFilePath.dir !== "") {
      slug = `/${parsedFilePath.dir}/${parsedFilePath.name}/`;
    } else if (parsedFilePath.dir === "") {
      slug = `/${parsedFilePath.name}/`;
    } else {
      slug = `/${parsedFilePath.dir}/`;
    }

    if (Object.prototype.hasOwnProperty.call(node, "frontmatter")) {
      if (Object.prototype.hasOwnProperty.call(node.frontmatter, "slug"))
        slug = `/${_.kebabCase(node.frontmatter.slug)}`;
      if (Object.prototype.hasOwnProperty.call(node.frontmatter, "date")) {
        const date = moment(node.frontmatter.date, siteConfig.dateFromFormat);
        if (!date.isValid)
          console.warn(`WARNING: Invalid date.`, node.frontmatter);

        createNodeField({
          node,
          name: "date",
          value: date.toISOString()
        });
      }
    }
    createNodeField({ node, name: "slug", value: slug });
    postNodes.push(node);
  }
};
*/

const { createFilePath } = require('gatsby-source-filesystem')
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  //console.log('node.internal.type', node.internal.type);
  switch (node.internal.type) {
    case 'ConfigJson':
      const fileNode = getNode(node.parent)
      createNodeField({
        name: 'path',
        node,
        value: `/${fileNode.relativeDirectory}/`,
      });
      break;

    case 'MarkdownRemark': {
      const { relativePath } = getNode(node.parent);
      const value = createFilePath({ node, getNode });
      createNodeField({
        node,
        name: 'slug',
        value: `/${relativePath.replace('.md', '.html')}`,
      });
      /* const value = createFilePath({ node, getNode })
      createNodeField({
        name: `slug`,
        node,
        value,
      }); */
    }

    default:
  }
};

/*
exports.setFieldsOnGraphQLNodeType = ({ type, actions }) => {
  const { name } = type;
  const { createNodeField } = actions;
  if (name === "MarkdownRemark") {
    addSiblingNodes(createNodeField);
  }
};
*/

exports.createPages = ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions;

  return new Promise((resolve, reject) => {
    const docsPage = path.resolve("src/templates/post.jsx");
    resolve(
      graphql(
        `
          {
            allConfigJson {
              edges {
                node {
                  version,
                  menus {
                    subMenus {
                      entry {
                        relativePath,
                        absolutePath
                      }
                    }
                  }
                  fields {
                    path
                  }
                }
              }
            }

            allMarkdownRemark{
              edges {
                node {
                  fields {
                    slug
                  }
                  excerpt
                  timeToRead
                  id
                  fileAbsolutePath
                  frontmatter {
                    type,
                    version
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        //console.log(util.inspect(result, false, null, true))
        if (result.errors) {
          // eslint no-console: "off"
          console.log(result.errors);
          reject(result.errors);
        }

        // We want to find the first docs file in the latest version so that we
        // can have /docs redirect to it
        const configs = result.data.allConfigJson.edges
          .slice()
          .sort((a, b) => b.node.version.localeCompare(a.node.version));
        const latestConfig = configs[0].node;
        const latestVersionBasePath = latestConfig.fields.path;
        const latestDocsStartFile = latestConfig.menus[0].subMenus[0].entry.absolutePath;
        let foundLatestDocsStartFile = false;
        let latestReleaseVersion;

        result.data.allMarkdownRemark.edges.forEach(edge => {
          const { slug } = edge.node.fields;
          //const parts = path.parse(edge.node.fileAbsolutePath);
          //const postPath = path.relative('./content', `${parts.dir}/${parts.name}`);
          //console.log({postPath});
          const obj = {
            path: slug,
            component: docsPage,
            context: {
              slug
            }
          };
          createPage(obj);

          if (slug.startsWith(latestVersionBasePath)) {
            console.log('fromPath', `/docs/${slug.slice(latestVersionBasePath.length)}`);
            createRedirect({
              fromPath: `/docs/${slug.slice(latestVersionBasePath.length)}`,
              isPermanent: true,
              redirectInBrowser: true,
              toPath: slug,
            });
          }

          // The latest version changes, so we want to do this dynamically for
          // each build
          if (edge.node.fileAbsolutePath === latestDocsStartFile) {
            if (foundLatestDocsStartFile) throw new Error(`latestDocsStartFile was already found ${latestDocsStartFile}`);
            foundLatestDocsStartFile = true;

            createRedirect({
              fromPath: '/docs/',
              isPermanent: true,
              redirectInBrowser: true,
              toPath: slug,
            });
          }

          if (slug.startsWith('/releases/')) {
            const match = slug.match(/^\/releases\/([^/]+)\.html$/);
            const version = match[1];
            if (!latestReleaseVersion || latestReleaseVersion.localeCompare(version) === 1) {
              latestReleaseVersion = version;
            }
          }
        });

        if (!foundLatestDocsStartFile) throw new Error(`no redirect for /docs setup, didn't find ${latestDocsStartFile}`);
        if (!latestReleaseVersion) throw new Error('No release found as the latest');

        createRedirect({
          fromPath: '/releases/',
          isPermanent: true,
          redirectInBrowser: true,
          toPath: `/releases/${latestReleaseVersion}.html`,
        });
      })
    );
  });
};
