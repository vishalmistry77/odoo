const Card = ({ className = '', ...props }) => (
  <div className={`card ${className}`.trim()} {...props} />
);

export default Card;
