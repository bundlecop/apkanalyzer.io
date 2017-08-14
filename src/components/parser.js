import 'babel-polyfill';
import JSZip from 'jszip';


export default async function readZipContent(file) {
  const zip = await JSZip.loadAsync(file);

  const contents = [];
  zip.forEach((relativePath, zipEntry) => {
    contents.push({
      name: relativePath,
      uncompressedSize: zipEntry._data.uncompressedSize,
      compressedSize: zipEntry._data.compressedSize,
    })
  });

  return contents;
}



/**
 * Taking a list of pathObjects with the path stored in ``attribute``,
 * and return a tree.
 */
export function treeFromFlatPathList(pathObjects, attribute, options)
{
  let {childAttribute, nameAttribute} = options;
  if (!childAttribute) { childAttribute = 'children'; }
  if (!nameAttribute) { nameAttribute = 'name'; }

  // Search "node" (tree) for a place for "path" (array of folders)
  // at level "idx" in the tree. When found, attach "dataObject".
  function buildNodeRecursive(node, path, dataObject, idx) {
    if (idx < path.length) {
      let item = path[idx];
      let dirLevel = node[childAttribute].find(child => child[nameAttribute] == item)

      // We need to create this level
      if (!dirLevel) {
        node[childAttribute].push(dirLevel = {
          [nameAttribute]: item,
          [childAttribute]: [],
          [attribute]: path.slice(0, idx+1).join('/')
        })
      }
      buildNodeRecursive(dirLevel, path, dataObject, idx + 1);
    }
    else {
      Object.assign(node, dataObject);
    }
  }

  const rootNode = {[nameAttribute]: "", [childAttribute]: []}
  for (let pathObject of pathObjects) {
    const path = pathObject[attribute].split('/');
    buildNodeRecursive(rootNode, path, pathObject, 0);
  }

  return rootNode;
}
