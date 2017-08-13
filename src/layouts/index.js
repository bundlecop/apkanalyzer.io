import React from 'react'
import PropTypes from 'prop-types'
import Link from 'gatsby-link'
import Helmet from 'react-helmet'

import './index.css'
import '../typography';


class TemplateWrapper extends React.Component {

  render() {
    return <div>
        <Helmet
          title="Android APK Size Analyzer"
          meta={[
            { name: 'description', content: 'Have a look inside an APK bundle, and figure out how to make it smaller.' },
            { name: 'keywords', content: 'android apk, apk size, analyze apk, inspect apk, browse apk' },
          ]}
        />
        <div
          style={{
            margin: '0 auto',
            maxWidth: 960,
            padding: '0px 1.0875rem 1.45rem',
            paddingTop: 0,
          }}
        >
          {this.props.children()}
        </div>

    </div>
  }
}


export default TemplateWrapper
