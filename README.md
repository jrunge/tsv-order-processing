# TSV processor

This script takes the `sampledata.tsv` file and converts it to the JSON specified in the SA-TechTest.md file. Output from the script will go to stdout.

### Getting started
```bash
npm install
node index.js
```
You can also use yarn for a faster install.

### General Comments and assumptions

Originally I was hoping to use streams to parallelize the record processing. However, the output data structure is dependent on interactions between rows. I decided it would be much easier to keep the whole output in memory. There are probably some optimizations to be done by first collecting only the required data from the rows, then assembling the output JSON.

There were several records with double quotes in the data. Fortunately, the parsing library I used escapes them using the `relax` option. It worked for this data set, but I would like to see it run on a larger data sample. I would also like to explore the quoting and escaping options for the library more thoroughly.

I assumed that all Category, Sub-Category and Product ID strings needed to be escaped before being used in the product url. Mostly, this was to eliminate spaces in existing Category and Sub-Category data, but it seemed a sensible precaution for all assembled fields.

### Libraries used

- [csv-parse](https://csv.js.org/parse/)
- [moment](https://momentjs.com/docs/)
- [lodash](https://lodash.com/docs/4.17.11#find)
