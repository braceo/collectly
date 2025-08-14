export { default } from '../[store]/page';
export const dynamicParams=false;
export async function generateStaticParams(){ return [{store:'demo'}]; }
