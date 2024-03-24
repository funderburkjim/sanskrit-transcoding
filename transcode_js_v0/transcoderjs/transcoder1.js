// File: transcoder1.js
// ejf: October 2012
// requires jQuery
// Start function when DOM has completely loaded 
transcoder = {
    dir : "",  // The server directory with transcoder files.
               // If non-empty string, should end in '/'.
               // used by 'fsm' function
    fsmarr : {} , // hash with keys like slp1_deva
    xml : "NO XML", // not really needed. 
    fsm_tempkey : "", // of form slp1_deva. Us
    fsminit_callback : function(xml) {
        //console.log('fsminit_callback: xml=',xml);
	var key = transcoder.fsm_tempkey; // the 'key' of this fsm
	var start = jQuery('fsm',xml).attr("start");
	var fsm = {} //finite state machine to construct
	fsm['start'] = start;
	// fsmentries is a list of fsmentry elements, each of which is a hash
	// corresponding to one of the 'e' elements in the xml file.
	var fsmentries = new Array(); 
        var n = 0;
        jQuery('e',xml).each(function(elt) {
	    // Retrieve the text values of subelements of this entry
	    var inval = jQuery(this).find('in').text();
	    // sval is state name of this entry. Can be comma-delimited list
	    var sval = jQuery(this).find('s').text(); 
	    var outval = jQuery(this).find('out').text();
	    var nextState = jQuery(this).find('next').text();
	    // Do some adjustments on the subelements
	    /*
             In transcoding from slp1 to devanagari, it is necessary to do a
             'look-ahead' when deciding how to code a consonant.  If the 
             consonant is not followed by a vowel,
	     then a vigraha has to be emitted.
             The input codes inval in such cases as:
             k/^([^aAiIuUfFxXeEoO^/\\])
             Which is to be intepreted as: starting at the next character,
             check if the input string does NOT match the regular expression
             [^aAiIuUfFxXeEoO^/\\].
             Note that the last 3 elements '^', '/', and '\' are present only
             because of accents. 
             except in these two cases, we process this entry no further.
            */
	    var conlook = false;
	    var match_temp = inval.match(/^([^/]+)\/\^/);            
	    if (match_temp) {
		if ( (key != 'slp1_deva') && (key != 'hkt_tamil')) {
		    return; // skip this entry
		}
		inval = match_temp[1];
		conlook = true;
	    }
	    // split 'sval' into an array of states
	    var startStates = sval.split(",");
	    // 'next' is optional. If absent, use the first 'sval'
            if ((nextState == null) || (nextState == '')) {
		nextState = startStates[0];
	    }
	    // inval, outval may be strings representing unicode.
	    // the format expected is \uxxxx\uyyyy  etc. where xxxx and yyyy are
	    // Since Javascript represents unicode strings this way,
	    // There is no adjustment required'. For sake of code compatibility,
	    // I retain the logic of php implementation.
	    var newinval = transcoder.to_unicode(inval);
	    var newoutval = transcoder.to_unicode(outval);
	    // construct this fsmentry as a hash of mixed values
	    var fsmentry = {};
	    fsmentry['starts'] = startStates;
	    fsmentry['in'] = newinval;
	    // fsmentry['regex'] is defined only when conlook is true
	    if (conlook) {
		fsmentry['regex'] = key; // otherwise, undefined
	    }
	    fsmentry['out'] = newoutval;
	    fsmentry['next'] = nextState;
	    // add fsmentry onto the array of the
	    fsmentries.push(fsmentry);
            n++;
	});
	// add fsmentries to the 'fsm' we are constructing, with key 'fsm'
	fsm['fsm'] = fsmentries;
        // make associative array states, whose keys are characters,
        // and whose value at a key is an array of subscripts into fsmentries.
        //  i is a subscript for a key provided that the fsmentries[i]['in'] = 
        //  first character of key
	var states = {};
	var fsmentry = null;
	var inval = null;
	var c = null;
	var state;
	for(var ientry=0;ientry<n;ientry++) {
	    fsmentry = fsmentries[ientry];
	    inval = fsmentry['in'];
	    c = inval[0]; // first character
	    if (c in states) {
		state = states[c];
		state.push(ientry);
		states[c] = state;
	    }else {
		state = new Array();
		state.push(ientry);
		states[c]=state;
	    }
	}
	// estables states in the 'fsm' we are constructing
	fsm['states'] = states;
	// the fsm construction is complete. Put it in the transcoder hash
	// table 'fsmarr' of constructed fsms
        //console.log('key=',key,'fsm=',fsm);
	transcoder.fsmarr[key] = fsm;
	//alert('fsm_callback: ' + n + ' entries');
	transcoder.xml = xml;
    },
    to_unicode : function (x) {
	// The input is a string, perhaps with embedded unicode represented
	// as for instance '\u0905'. We replace this with '0x0905' and
	// use the String.fromCharCode method to get the unicode.
	return x.replace(/\\u([a-fA-F0-9]{4})/g,function(m0,m1) {return String.fromCharCode("0x"+m1);});
	
    },
    // 'fsm' initializes fsmarr for a given 'from' and 'to' encoding
    // The initialization is done from a server xml file.
    // It foregoes the initialization if it has already been done.
    fsminit : function(sfrom,to) {
        transcoder.fsm_tempkey = sfrom + "_" + to;
	if (transcoder.fsm_tempkey in transcoder.fsmarr) {
	    return
	}
	var filename = sfrom + "_" + to + ".xml";
	var pathname = this.dir + filename;
	//console.log('pathname=',pathname);
	//alert('pathname = ' + pathname);
	// the callback constructs an element of fsmarr; it needs to know
	// the key under which to store the fsm. The next is one way to
	// pass this information
	// In my usage, I need this to be synchronous.
	jQuery.ajaxSetup({async:false});
	jQuery.get(pathname,{},this.fsminit_callback,"xml");
	jQuery.ajaxSetup({async:true});
    },
    processString : function(line,from1,to) {
	if (from1 == to) {return line;}
	var fromto = from1 + "_" + to;
	var fsm;
	if (fromto in transcoder.fsmarr) {
	    fsm = transcoder.fsmarr[fromto];
	}else {
	    transcoder.fsminit(from1,to);
	    if (fromto in transcoder.fsmarr) {
		fsm = transcoder.fsmarr[fromto];
	    }else {
		return line;
	    }
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
