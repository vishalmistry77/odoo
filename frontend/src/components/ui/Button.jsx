const Button = ({ className = '', variant = 'primary', type = 'button', ...props }) => {
  const variantClass = variant === 'secondary' ? 'btn-secondary' : 'btn-primary';
  return <button type={type} className={`${variantClass} ${className}`.trim()} {...props} />;
};

export default Button;
