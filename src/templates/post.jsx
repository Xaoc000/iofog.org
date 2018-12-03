import React from 'react';
import Helmet from 'react-helmet';
import { graphql } from 'gatsby';
import Layout from '../layout';
import SEO from '../components/SEO/SEO';
import config from '../../data/SiteConfig';
import './b16-tomorrow-dark.css';
import './post.scss';
import DocsSidebar from '../components/DocsSidebar/DocsSidebar';
import Edgeworx from "../components/Egdeworx/Edgeworx";
import swaggerSpec from '../../third_party/FogController/specs/swagger.yml';
import './swagger-ui';

export default class PostTemplate extends React.Component {
  postRef = React.createRef();

  async componentDidMount() {
    const swaggerEl = this.postRef.current.querySelector('swagger-ui');

    /* if (swaggerEl) {
      // swagger-ui doesn't work in SSR. In fact if you even
      // import it server-side it throws errors.
      const [{ default: SwaggerUI }, _] = await Promise.all([
        import('swagger-ui'),
        import('swagger-ui/dist/swagger-ui.css')
      ]);
      SwaggerUI({
        domNode: swaggerEl,
        //url: 'https://petstore.swagger.io/v2/swagger.json'
        //spec: swaggerSpec
        url: `https://unpkg.com/iofogcontroller@${}/specs/swagger.yml`
      });
    } */
  }

  render() {
    const { pageContext, data } = this.props;
    console.log('props', this.props);
    const { slug } = pageContext;
    const postNode = data.markdownRemark;
    const post = postNode.frontmatter;
    const versions = data.allConfigJson.edges
      .slice()
      .sort((a, b) => {
        return b.node.version.localeCompare(a.node.version);
      });

    return (
      <Layout location="/test">
        <Helmet>
          <title>{`${post.title} | ${post.category} | ${config.siteTitle}`}</title>
        </Helmet>
        <SEO postPath={slug} postNode={postNode} postSEO />
        <div className="container-fluid">
          <div className="row post">
            <div className="menu-list col-12 col-lg-3">
              <div className="row">
                <DocsSidebar versions={versions} activePath={slug} />
              </div>
            </div>
            <div className="post-container col-12 col-lg-9 bg-grey">
              <div className="row">
                <div className="offset-1 offset-lg-1 offset-xl-1" />
                <div className="col-12 col-lg-10">
                  <div ref={this.postRef} dangerouslySetInnerHTML={{ __html: postNode.html }} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Edgeworx />
      </Layout>
    );
  }
}

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      timeToRead
      excerpt
      frontmatter {
        title
        category
      }
      fields {
        slug
      }
    }

    allConfigJson {
      edges {
        node {
          version
          menus {
            title
            subMenus {
              title
              entry {
                ...menuEntry
              }
            }
          }
          fields {
            path
          }
        }
      }
    }
  }

  fragment menuEntry on File {
    childMarkdownRemark {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`;
