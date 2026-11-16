# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Running the app

Start the backend from the `backend-fashion` folder:

```sh
npm run dev
```

Start this React app in a second terminal:

```sh
npm start
```

The frontend connects to `http://localhost:5001` by default. The backend's `.env` file sets its port to `5001` and allows requests from `http://localhost:3000`. If the backend runs at a different URL, set `REACT_APP_API_URL` before starting the frontend.

## Production deployment

Set `REACT_APP_API_URL` to the public HTTPS backend origin in the frontend hosting provider before building. Do not put Paystack secret keys or email credentials in frontend variables; payment initialization and verification happen on the backend. Configure the frontend host to serve the single-page app routes `/payment/callback`, `/verify-email`, and `/reset-password` by rewriting unknown paths to `index.html`.

The root `vercel.json` configures this Create React App build and its client-side route fallback. To deploy, push `feature/modern-ecommerce`, import `victoria-umoh/frontend-fashion` into Vercel, and set that branch as the production branch (otherwise it will be a preview deployment). Add `REACT_APP_API_URL` as a Vercel environment variable using the Render API's HTTPS origin, then redeploy. After both provider URLs exist, set the Render `FRONTEND_URL` to the Vercel origin. Keep all private credentials in Render, never in Vercel's `REACT_APP_*` variables.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
