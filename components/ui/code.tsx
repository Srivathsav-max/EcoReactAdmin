interface CodeProps {
  content: string;
  className?: string;
}

export const Code: React.FC<CodeProps> = ({
  content,
  className
}) => {
  return (
    <pre className={`
      bg-slate-100 
      dark:bg-slate-800 
      p-4 
      rounded-md 
      overflow-x-auto 
      text-slate-800 
      dark:text-slate-100
      ${className}
    `}>
      <code>{content}</code>
    </pre>
  );
};
