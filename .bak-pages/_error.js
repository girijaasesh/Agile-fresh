function Error({ statusCode }) {
  return (
    <p>{statusCode ? `An error ${statusCode} occurred` : 'An error occurred'}</p>
  );
}
Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
export default Error;
