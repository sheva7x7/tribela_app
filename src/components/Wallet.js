import React from "react";
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import {Link} from 'react-router-dom'
import moment from 'moment'
import axios from '../utils/axios'
import * as userActions from '../actions/user'
import { TRIBELA_URL } from '../utils/constants'
import _ from 'lodash'
import {validateEmail} from '../utils/helper'

import { getPath } from '../selectors'

import './styles/wallet.less'

class Wallet extends React.Component {
  static getDerivedStateFromProps(nextProps, prevState){
    if (!_.isEqual(prevState.user, nextProps.user)){
      return {
        user: nextProps.user
      }
    }
    return null
  }

  constructor(props){
    super(props)

    this.state = {}
    this.state.user = this.props.user
    this.state.transactions = []
    this.state.transactionsReachedEnd = false

    this.trackScrolling = this.trackScrolling.bind(this)
    this.loadMoreTransactions = _.debounce(this.loadMoreTransactions.bind(this), 1000, {leading: true})
    this.loadMyTransactions = this.loadMyTransactions.bind(this)
  }

  componentDidMount() {
    window.addEventListener('scroll', this.trackScrolling)
    this.props.actions.retrieveUserProfile(this.state.user.user_id)
    this.loadMyTransactions()
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.trackScrolling)
  }

  trackScrolling() {
    const wrappedElement = document.getElementById('my_transactions_section')
    if (wrappedElement){
      if (wrappedElement.getBoundingClientRect().bottom < window.innerHeight + 100){
        this.loadMoreTransactions()
      }
    }
  }

  loadMoreTransactions() {
    if (!this.state.transactionsReachedEnd){
      this.loadMyTransactions()
    }
  }

  loadMyTransactions(){
    const data = {
      user: {
        id: this.state.user.id
      },
      offset: this.state.transactions.length
    }
    axios.post(`${TRIBELA_URL}/usertranactions`, data)
          .then((res) => {
            if (res.data.length > 0){
              console.log(res.data)
              const newTransactions = res.data
              const transactions = this.state.transactions.concat(newTransactions)
              this.setState({
                transactions
              })
            }else {
              this.setState({
                transactionsReachedEnd: true
              })
            }
          })
          .catch((err) => {
            if (err.response.status === 600 ){
              this.setState({
                transactionsReachedEnd: true
              })
            }
            console.log(err)
          })
  }

  render() {
    return (
      <div className='wallet_container'>
        <div className='wallet_frame'>
          <div className='wallet_section'>
            <img width='100%' src='./assets/wallet_banner.jpg'/>
            <div className='wallet_title'>
              <p>
                Wallet
              </p>
              <img src='/assets/wallet.png' className='wallet_icon' />
              <p className='wallet_balance'>
                {this.state.user.stuff_war_points} Points
              </p>
            </div>
          </div>
          <div id='my_transactions_section' className='transaction_section'>
            <div className='transaction_list'>
              <div className='transaction_row transaction_row_header'>
                <div className='transaction_date'>
                  Date
                </div>
                <div className='transaction_activity'>
                  Activity
                </div>
                <div className='transaction_points'>
                  Points
                </div>
              </div>
              {
                this.state.transactions.map((transaction, i) => (
                  <div key={i} className={`transaction_row ${i%2 === 1 ? 'transaction_row_even' : ''} `}>
                    <div className='transaction_date'>
                      {moment(transaction.transaction_time).format('YYYY/M/DD')}
                    </div>
                    <div className='transaction_activity'>
                      {transaction.remarks}
                    </div>
                    <div className='transaction_points'>
                      {transaction.points}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
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

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    actions: bindActionCreators(userActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Wallet)