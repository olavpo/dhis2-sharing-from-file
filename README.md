# Update DHIS2 Sharing From File

Node.js tool for applying sharing settings on an online DHIS2 instance for objects found in a DHIS2 metadata file. Uses (and requires) [dhis2-pk](http://github.com/davidhuser/dhis2-pk) to be installed, and uses the same syntax as described in the [dhis2-pk documentation for sharing](https://github.com/davidhuser/dhis2-pk/blob/master/docs/share.md), with one exception: instead of specifying the object type and object filter (arguments -t and -f), one specifies the path to a file with argument `-m`. The command is then executed for all (shareable) objects in that file.


### Example
```
node app.js -m ../metadata.json -s localhost:8081/dev -u admin -p district -a readonly -g 'id:eq:Ubzlyfqm1gO' readwrite readonly -g 'id:eq:pyu2ZlNKbzQ' readonly readonly -g 'id:eq:UKWx4jJcrKt' none readwrite
```

In this example, all objects in metadata.json that also exists in localhost:8081/dev will have the following sharing settings applied:

* Public access: metadata read, data none
* Group Ubzlyfqm1gO: metadata edit, data read
* Group pyu2ZlNKbzQ: metadata read, data read
* Group UKWx4jJcrKt: metadata none, data edit


### Data sharing
The syntax for applying metadata and data sharing is `-a/-g [METADATA ACCESS] [DATA ACCESS]`, e.g. `-a [readonly] [readwrite]`. A metadata file may contain both object types that support data sharing and objects that do not support data sharing. In cases where only metadata sharing is specified, data sharing will be set up "none" for data shareable objects. Similarly, the data sharing parameter will be ignored for object types that does not support data sharing.