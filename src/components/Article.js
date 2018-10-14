import React from "react";
import {connect} from 'react-redux'
import Linkify from 'react-linkify'
import moment from 'moment'
import axios from '../utils/axios'
import { TRIBELA_URL, STUFF_WAR_URL } from '../utils/constants'
import _ from 'lodash'
import {
  FacebookShareButton, 
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon
} from 'react-share'
import xml2js from 'xml2js'

import { getPath } from '../selectors'

import './styles/article.less'

const tagNameProcessors = (name) => {
  console.log(name)
  return name
}

const attrNameProcessors = (name, value) => {
  console.log(name, value)
  return name
}

class Article extends React.Component {
  constructor(props){
    super(props)

    this.state = {}
    this.state.article = {}
    this.state.article_id  = this.props.match.params.id
    this.state.xmlDoc = null

    this.retrieveArticle = this.retrieveArticle.bind(this)
    this.retrieveXML = this.retrieveXML.bind(this)
    this.renderXML = this.renderXML.bind(this)
    this.renderBody = this.renderBody.bind(this)
    this.renderHeader = this.renderHeader.bind(this)
  }

  componentDidMount() {
    this.retrieveArticle()
  }

  componentWillUnmount() {

  }

  retrieveArticle() {
    const data = {
      article: {
        id: this.state.article_id
      }
    }
    axios.post(`${TRIBELA_URL}/article`, data)
        .then((res) => {
          console.log(res)
          this.setState({
            article: res.data
          }, () => {
            this.retrieveXML(this.state.article.article_url)
          })
        })
        .catch((err) => {
          console.log(err)
        })
  }

  retrieveXML(url) {
    axios.get(url)
				.then(res => {
          xml2js.parseString(res.data, {
            preserveChildrenOrder: true,
            explicitChildren: true
          }, (err, result) => {
            console.log(result)
            this.setState({
              xmlDoc: result
            })
					})
				}).catch(error => {
					console.log(error)
				})
  }

  renderHeader(node, key) {
    return (
      this.state.article.thumbnail_url?
      <div key={key} className='article_header'>
        <img src={this.state.article.thumbnail_url} className='article_header_image' />
        <div className='article_header_captions article_header_absolute'>
          <div className='article_title'>
            {
              node.title
            }
          </div>
          <div className='article_subtitle'>
            {`Published by ${node.author} on ${moment(this.state.article.publish_time).format('MMM DD, YYYY')} `}
          </div>
        </div>
      </div>:
      <div key={key} className='article_header'>
        <div className='article_header_captions'>
          <div className='article_title'>
            {
              node.title
            }
          </div>
          <div className='article_subtitle'>
            {`Published by ${node.author} on ${moment(this.state.article.publish_time).format('MMM DD, YYYY')} `}
          </div>
        </div>
      </div>
    )
  }

  renderBody(node, key){
    return (
      <div key={key} className='article_body'>
        {
          node.$$.map((child, i) => {
            switch(child['#name']){
              case 'paragraph':
                return (
                  <Linkify key={i} className='article_paragraph'>
                    <p>
                      {child['_']}
                    </p>
                  </Linkify>
                )
              case 'heading':
                return (
                  <h3 key={i}>
                    {child['_']}
                  </h3>
                )
              case 'pwomargin':
                return (
                  <Linkify key={i} >
                    <p className='article_paragraph_no_margin'>
                      {child['_']}
                    </p>
                  </Linkify>
                )
              case 'image':
                return (
                  <img key={i} className='article_image' src={child['$'].src} width={child['$'].width}/>
                )
              case 'youtube':
                return (
                  <iframe key={i} className='article_youtube_iframe' src={child['$'].src} />
                )
              default:
                null
            }
          })
        }
      </div>
    )
  }

  renderXML() {
    return (
      <div className='article_container'>
        <div className='article_frame'>
          {
            this.state.xmlDoc.article.$$.map((child, i) => {
              return child['#name'] === 'header' ? 
              this.renderHeader(child, i):
              this.renderBody(child, i)
            })
          }
          <div className='article_footer'>
            <div className='article_footer_text'>
              <h3>
                SHARE LEH!
              </h3>
            </div>
            <div className='article_footer_social_icons'>
              <FacebookShareButton
                url={`${STUFF_WAR_URL}article/${this.props.match.params.id}`}
                quote={this.state.article.title}
                className='share_icon'
              >
                <FacebookIcon
                  size={20}
                  round />
              </FacebookShareButton>
              <TwitterShareButton
                url={`${STUFF_WAR_URL}article/${this.props.match.params.id}`}
                title={this.state.article.title}
                className='share_icon'
              >
                <TwitterIcon
                  size={20}
                  round />
              </TwitterShareButton>
              <WhatsappShareButton
                url={`${STUFF_WAR_URL}article/${this.props.match.params.id}`}
                title={this.state.article.title}
                separator=' - '
                className='share_icon'
              >
                <WhatsappIcon
                  size={20}
                  round />
              </WhatsappShareButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render() {
    return (
      this.state.xmlDoc?
      this.renderXML():
      <div className='article_container'>
        <div className='article_frame'>
          <div className='loading'/>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    location: getPath(state),
    user: state.user
  }
}

export default connect(
  mapStateToProps
)(Article)