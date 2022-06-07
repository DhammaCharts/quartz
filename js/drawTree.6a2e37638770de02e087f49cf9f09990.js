async function drawTree(pathBase, pathWindow){

const { content } = await fetchData;

// COMMENT : add a uid for pages and folders id ? will avoid problems if duplicates

// this is for the tree display on page
var treeDoc = new Tree(document.getElementById('tree'), {
  navigate: true // allow navigate with ArrowUp and ArrowDown
});

// we want to build an array of objects, one for each page and folder (type)
// dataJSON is `contentIndex.json`
const tree = [];

for (let path in content) {
  const c = content[path];
  const pageTitle = c.title;
  const crumb = path.split("/");
  // ['', 'folder1','folder2', ... , pageId ]
  let pageId = crumb.pop();
  if (pageId == '') pageId = '_ROOT_';
  let parentFolderId = crumb.slice(-1)[0];
  if (parentFolderId == '' && pageId == '_ROOT_') parentFolderId = 'SUPER-ROOT';
  if (parentFolderId == '') parentFolderId = 'ROOT';
  parentFolderId = '_' + parentFolderId + '_'; // added to distinguished from pageId

  // we found a page
  tree.push({
    id: pageId,
    parentId: parentFolderId,
    name: pageTitle,
    type: 'page',
    href: pathBase.slice(0, pathBase.length - 1) + path
  })

  // if the page is in one or more folders
  crumb.forEach((folderId, level) => {
    let parentId = crumb[level - 1];
    if (parentId == '') {
      parentId = '_ROOT_'
    } else {
      parentId = '_' + parentId + '_';
    }

    // we found a folder
    const push = {
      id: '_' + folderId + '_',
      parentId: parentId,
      name: folderId.replace(/-/g, ' '),
      // type: 'folder',
      type : Tree.FOLDER,
      level: level
    }

    // avoid duplicates of folders
    if (folderId != '' && !tree.some(el => JSON.stringify(el) === JSON.stringify(push)))
      tree.push(push);
  });
}

// METHODE 1
// FYI https://www.jstree.com/docs/json/ doesn't need a hierarchial JSON
// it needs jQuery though.

//METHODE 2
// build the hierarchial JSON
// from https://typeofnan.dev/an-easy-way-to-build-a-tree-with-object-references/
let root;

const idMapping = tree.reduce((acc, el, i) => {
  acc[el.id] = i;
  return acc;
}, {});

tree.forEach((el) => {
  // Handle the root element
  if (el.parentId == '_SUPER-ROOT_') {
    root = el;
    return;
  }
  // Use our mapping to locate the parent element in our data array
  const parentEl = tree[idMapping[el.parentId]];
  // Add our current el to its parent's `children` array
  parentEl.children = [...(parentEl.children || []), el];
});

// display tree structure
// from https://www.cssscript.com/folder-tree-json/

const structure = root.children
treeDoc.json(structure);

// click on node go to page
treeDoc.on('select', e => {
  if (e.getAttribute('href')) window.location.assign(e.getAttribute('href'))
});

// open tree at current node
// const crumb = pathWindow.split("/");
// const crumbNoBase = crumb.splice(2,crumb.length-3)

// treeDoc.browse(a => {
//   if (crumbNoBase.includes(a.innerHTML)) {
//     // if (a.node.name.startsWith('folder 1') || a.node.name === 'file 1/1/1/1/2') {
//     return true;
//   }
//   return false;
// });

// other calls :
// treeDoc.on('action', e => console.log('action', e));
// treeDoc.on('open', e => console.log('open', e));
// treeDoc.on('select', e => console.log('select', window.location.assign(e.getAttribute('href'))));

}
