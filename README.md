# THREE.JS GENETIC CODE NEUTRAL NETWORKS EXPLORER

![alt text](https://github.com/calugo/RNA-NETS/blob/master/RNANET.png "CODONS NET")


```html
<div>
 <iframe src="https://calugo.github.io/RNA-NETS/"
 style="border: 3px dotted black; width: 100%; height: 500px;"> </iframe>
</div>
```

This is the network of codons gruped according to the aminoacid they belong to.

Each node represents a codon and it is connected to those codons one mutation away.

Use the mouse to highlight a codon and the links to its neighbours, the links higlighted in blue are links to codons in the same aminoacid and links highlighted black are
 to neighbour codons in other aminoacids.
 
Use the mouse to interact with the network as follows:

1. Left button: Rotate the view.

2. Center button or track-wheel: Zoom in or out.

3. Right button: Translate the view to right or to the left.


The recommended way to play with the viewer, is on a full screen, which can be accessed <a href="https://calugo.github.io/RNA-NETS/" target="_blank">here</a> and a legacy version with draggable nodes  <a href="https://calugo.github.io/RNA-NETS/OLDNET" target="_blank">here</a>

A pretty jupyter notebook to generate pretty images of each aminoacid's connections [here](http://nbviewer.jupyter.org/github/calugo/RNA-NETS/blob/master/NOTEBOOKS/AMINOACIDS.ipynb).

Cheers!
