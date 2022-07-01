async function drawTree(pathBase, pathWindow){

const { content } = await fetchData;

// COMMENT : add a uid for pages and folders id ? will avoid problems if duplicates in page name and folder name

'use strict';
class CustomTree extends Tree {
  // avoid auto scroll to selected element
  focus() {
    console.log('skipped');
  }
}

var treeJS = new CustomTree(document.getElementById('tree'), {
  dark: false,
  navigate: true // allow navigate with ArrowUp and ArrowDown
});

// we want to build an array of objects, one for each page and folder (type)
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
// it needs jQuery though. Not used for the moment

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

// keep track of the original node objects
const structure = root.children;

treeJS.on('created', (e, node) => {
  e.node = node;
});
// console.log(structure);
treeJS.json(structure);

// open tree at current node
const crumb = pathWindow.split("/");
const crumbNoBase = crumb.splice(2,crumb.length-3)

for (let i = 0 ; i < crumbNoBase.length - 1 ; i ++)
{
  crumbNoBase[i] = '_'+crumbNoBase[i]+'_'
}

let treeIsOpen = false;
treeJS.on('select', e => {
  // allow simple click to open folder, Bug on Safari for node click !
  if (e.tagName === 'SUMMARY') treeJS.open(e.parentElement);

  // click on node to go to page
  if (  treeIsOpen
    &&  e.node.type      == 'page'
    &&  e.node.href+'/' !=  pathWindow)
    window.location.href =  e.node.href;

});
// let i = 0

function openTree(){
      var p = new Promise(function(success) {
        // open the tree at the current page
        treeJS.browse(a => {
          // console.log(i);
          // i++
          // console.log(crumbNoBase);
          // console.log(a.node.id);
          if(crumbNoBase.indexOf(a.node.id) !== -1) {
              return true;
          }
          return false;
        });
        success();
      });
    return p;
}

function setOpenTree(){
    let p = openTree();
    p.then(function(s) {
      treeIsOpen = true;
      console.log("tree is open");
    });
}

setOpenTree()

}
