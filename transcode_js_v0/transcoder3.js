// File: transcoder3.js
// ejf: October 12 2012
// requires jQuery
// This retrieves 'fsmarr' from json.
// Assume that transcoder.fsmarr is initialized in a separately loaded
// javascript file, such as transcoderJson.js.
// This file can be created from server xml files, with transcoder1.js, via 
// the functions in chrome_createJson.js.
transcoder = {
    fsmarr : {} , // hash with keys like slp1_deva. 
    processString : function(line,from1,to) {
	if (from1 == to) {return line;}
	var fromto = from1 + "_" + to;
	var fsm;
	if (fromto in transcoder.fsmarr) {
	    fsm = transcoder.fsmarr[fromto];
	}else {
	    // we're out of luck
	    return line;
	}
	var currentState=fsm['start'];
        var fsmentries = fsm['fsm'];
        var states = fsm['states'];
        var n=0; // current character position in line
        var result=''; // returned value
        var m=line.length;
	while (n < m) {
	    var c = line[n]; // character at position n
	    if (! (c in states)) {
		result += c;
		currentState = fsm['start'];
		n++;
		continue; // continue with loop
	    }
	    var isubs = states[c];
	    var best = "";
	    var nbest = 0;
	    var bestFE = null;
	    var isub;
	    var i;
	    //console.log('transcoder 0: ',line,n,c,isubs);
	    for (i=0;i<isubs.length;i++) {
		isub = isubs[i];
		var fsmentry=fsmentries[isub];
		var startStates=fsmentry['starts'];
		var k=-1;
		var nstartStates=startStates.length;
		var j=0
		while (j < nstartStates) {
		    if (startStates[j] == currentState) {
			k=j;
			j=nstartStates;
		    }
		    j += 1;
		}
                //console.log('transcoder 1a: ',isub,k,fsmentry,startStates,currentState);
		if (k == -1) {continue;}
		var match = transcoder.processString_match(line,n,m,fsmentry);
		var nmatch=match.length;
		//console.log('transcoder1 : ',line,n,line[n],match,i,fsmentry);
                //   echo "chk2: n=n, c='c', nmatch=nmatch<br>\n"
		if (nmatch > nbest) {
		    best = match;
		    nbest=nmatch;
		    bestFE=fsmentry;
		}
	    }
           if (bestFE) {
		result += bestFE['out'];
		n += nbest;
		currentState=bestFE['next'];
	    } else {
		// Default condition. emit the character and change state to start
		result += c;
		currentState=fsm['start'];
		n += 1;
	    }
	    //console.log('transcoder2 : ',line,n,line[n],bestFE,result);
 	}
	return result;
    },
    processString_match : function(line,n,m,fsmentry) {
	var match=""; // return value
        var edge = fsmentry['in'];
        var nedge=edge.length;
        var j=n;
        var k=0;
        var b=true;
	while ( (j < m) && (k < nedge) && b) {
	    if(line[j] == edge[k]) {
		j += 1;
		k += 1;
	    }else {
		b=false;
	    }
	}
	if (! b) {
	    return match;
	}
	if (k != nedge) {
	    return match;
	}
	match=edge;
	if (! ('regex' in fsmentry)) {
	    return match;
	}
	//  additional logic when fsmentry['regex'] is DEVA or TAMIL
	//  see discussion of 'regex' in transcoder_fsm
	//  This logic only works with slp1_deva xml file.
	//  Also, it ignores the use of '/^\' as vowel accents.
	var nmatch=match.length;
	var n1=n+nmatch;
	if (n1 == m) {
	    return match;
	}
	var d = line[n1];
	if (fsmentry['regex'] == 'slp1_deva') {
	    if (d.match(/[^aAiIuUfFxXeEoO]/)) {
		return match;
	    }else {
		return "";
	    }
	}
	if (fsmentry['regex'] == 'slp1_tamil') {
	    if (d.match(/[^aAiIuUeEoO]/)) {
		return match;
	    }else {
		return "";
	    }
	}
	if (fsmentry['regex'] == 'deva_slp1') {  //new 2024
	    const virAma = '\u094d';
	    const vowels = ['\u094d','\u093e','\u093f','\u0940','\u0941','\u0942','\u0943','\u0944','\u0962','\u0963','\u0947','\u0948','\u094b','\u094c'];
	    // console.log("match=",match,"d=",d);
	    if (d == virAma) {
		//console.log(d,"is virama");
		return "";
	    }else if (vowels.indexOf(d) >= 0) {
		//console.log(d,"is a vowel");
		return "";
	    }else {
		//console.log(d,"is not a vowel or virAma")
		return match;
	    }
	}
	return "";
    },
    processElements : function(line,from1,to,tagname) {
	/*  Assume parts of line to be converted are marked in an xml way.
            For example, if tagname = 'SA':
            and line = 'The word <SA>rAma</SA> refers to a person',
            returned would be 'The word XXX refers to a person',
            where XXX is the transformation of the the string 'rAma'
	    acc. to from1,to
	  */
        var regexstr = "<" + tagname + ">(.*?)</" + tagname + ">";
	//console.log(regexstr);
	var regex = new RegExp(regexstr,"g");
	return line.replace(regex,function(m0,m1) {return transcoder.processString(m1,from1,to);});
    }
};
