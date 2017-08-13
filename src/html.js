import React from 'react'
import {GoogleFont, TypographyStyle} from 'typography-react'
import typography from './typography';


export default class HTML extends React.Component {
  render () {
    return (
      <html lang="en">
        <head>
          <title>Android APK Size Analyzer</title>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <GoogleFont typography={typography} />
          <TypographyStyle typography={typography} />
          {this.props.headComponents}
        </head>
        <body>
          <div
            id="___gatsby"
            dangerouslySetInnerHTML={{ __html: this.props.body }}
          />
          {this.props.postBodyComponents}
        </body>
      </html>
    )
  }
};
