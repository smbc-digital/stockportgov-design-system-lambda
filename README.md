<h1 align="center">Stockportgov Design System Lambda</h1>

<div align="center">
  :running: :v: :muscle:
</div>
<div align="center">
  <sub>Built with ❤︎ by
    <a href="https://www.stockport.gov.uk">Stockport Council</a> and
    <a href="">
      contributors
    </a>
  </sub>
</div>

Stockportgov design system lambda function to serve .css files depenendent on the version requested. 

The lambda function returns a 302 to the relevant file in S3. If no files can be found or an error occurs then either a 400, or 404 is returned.


## Table of Contents
- [Requirements](#requirements)
- [Installation](#installation)
- [Development](#development)
- [Contributing](#contributing)

## Requirements
* npm
* node
* jest

## Installation
* clone repo
* `npm i`

## Development
* All code has be written in index.js, as the lambda function is rather small.
* All tests have been written in index.test.js for the same reason as above.
* We are not using nodes `--experimental-modules` as this flag is not available on AWS lambdas. Therefore, things like `import x from 'y'` are not available.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)