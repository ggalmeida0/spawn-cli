declare module 'editor' {
  function editor(content: string, callback: (code: number, output: string) => void): void;
  export default editor;
}