import React from "react"
import {Link} from 'react-router-dom'

import { formatDate } from '../../utils/helper'

import '../styles/announcements.less'

export default class ArticleList extends React.PureComponent {
  render() {
    return (
      <div className='announcements_container'>
        <div className='announcements_frame'>
          <div className='announcements_section'>
            <div className='announcements_title'>
              <p>
                {this.props.title}
              </p>
            </div>
          </div>
          <div className='announcements_section'>
            {
              this.props.articleDateKeys.map((date, i) => (
                <div className='announcement_date_section' key={i}>
                  <div className='announcement_date_text'>
                    {formatDate(date)}
                  </div>
                  {
                    this.props.articleData[date].map((article, j) => (
                      <Link to={`/article/${article.id}`} key={j} className='announcements_row' >
                        {
                          article.thumbnail_url ? 
                          <img src={article.thumbnail_url} className='announcement_thumbnail'/>:
                          null
                        }
                        <div className='announcement_headline'>
                          <div className='announcement_title'>
                            {article.title}
                          </div>
                          <div className='announcement_summary'>
                            {article.summary}
                          </div>
                        </div>
                      </Link>
                    ))
                  }
                </div>
              ))
            }
          </div>
        </div>
      </div>
    )
  }
}