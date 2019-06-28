//https://github.com/davidhuser/dhis2-pk/blob/master/docs/share.md

var fs = require("fs");
var {execSync} = require('child_process');


var metadata;
var queue;

//From 2.30 schema - objects with data sharing
const dataSharableTypes = ["categoryOptions", "dataSets", "relationshipTypes", "trackedEntityTypes", "programStages", "programs"];
const notShareableTypes = ["attributeValues", "users", "pushAnalysiss", "externalFileResources", "oAuth2Clients", "options", "jobConfigurations", "colorSets", "organisationUnits", "organisationUnitLevels", "categoryOptionCombos", "indicatorTypes", "analyticsTableHooks", "dataEntryForms", "dataSetNotificationTemplates", "sections", "validationNotificationTemplates", "programTrackedEntityAttributeGroups", "programStageSections", "programNotificationTemplates", "smsCommands", "programSections", "programRuleVariables", "programRuleActions", "programRules", "mapViews", "validationResults", "predictors", "dashboardItems", "legends", "programStageDataElements", "dataInputPeriods", "reportingRates", "dataElementGroupSetDimensions", "icons", "analyticsPeriodBoundarys", "interpretationComments", "trackedEntityTypeAttributes", "dataElementOperands", "userCredentialss", "fileResources", "programDataElements", "programStageInstances", "programTrackedEntityAttributes", "userAccesss", "trackedEntityInstanceFilters", "colors", "programInstances", "relationships", "trackedEntityInstances", "metadataVersions", "messageConversations", "userGroupAccesss", "categoryOptionGroupSetDimensions", "ProgramTrackedEntityAttributeDimensionItems", "dataElementDimensions", "categoryDimensions", "dataSetElements", "organisationUnitGroupSetDimensions", "trackedEntityDataElementDimensions", "minMaxDataElement"];

var programArgs = process.argv.slice(2).join(" ").split("-").slice(1).map(s => s.trim());

load();
process();
console.log("Done processing. Will now use dhis2-pk-share to update " + arg("s"));
push();


function load() {
	var fileName = arg("m");
	console.log(fileName);
	try {
		metadata = JSON.parse(fs.readFileSync(fileName, "utf8"));
	}
	catch (err) {
		console.log("Problem reading metadata file: " + fileName);
		console.log(err);
		process.exit(1);
	}
}


function process() {
	queue = [];
	for (var type in metadata) {
		var ids = [];
		if (Array.isArray(metadata[type])) {
			for (var object of metadata[type]) {
				//"default" cannot be changed
				if (type.startsWith('categor') && object.name == 'default') continue;
				else if (object.hasOwnProperty("id")) ids.push(object.id);
			}
		}
		
		if (ids.length == 0) continue;
		
		if (notShareableTypes.indexOf(type) >= 0) {
			console.log("Skipping (not shareable): " + type);
			continue;
		}
		
		var dataShareable = dataSharableTypes.indexOf(type) >= 0;
		toQueue(type, ids, dataShareable);
	}
}

function toQueue(type, ids, dataShareable) {
	var cmd = "dhis2-pk-share -s " + arg('s') + " -u " + arg("u") + " -p " + arg("p");
	cmd += " -t " + type + " -f " + "id:in:[" + ids.join(",") + "]";
		
	if (arg("a")) {
		if (dataShareable) {
			cmd += " -a " + arg("a");
			if (arg("a").split(" ").length < 2) cmd += " none"
		}
		else {
			cmd += " -a " + arg("a").split(" ")[0];
		}
	}
	
	if (arg("g")) {
		var groups = arg("g");
		for (var group of groups) {
			if (dataShareable) {
				cmd += " -g " + group;
				if (group.split(" ").length < 3) cmd += " none"
			}
			else {
				cmd += " -g " + group.split(" ").slice(0,2).join(" ");
			}
		}
	}
	if (arg("d")) cmd += " -d";
	if (arg("o")) cmd += " -o";
	if (arg("l")) cmd += " -l " + arg("l");
	if (arg("v")) cmd += " -v " + arg("v");
	
	queue.push(cmd);
}


function push() {
	var command = queue.pop();
	if (!command) {
		console.log("All done!");
		return;
	}
	
	execSync(command, function(err, stdout, stderr) {
  		if (err) {
	    	console.log(stderr);
	    	console.log(err);
	    	return;
		}
		console.log(stdout);
	});
	
	push();
	
}
	

function arg(argument) {
	var results = [];
	for (var current of programArgs) {
		//arguments with content
		if (current.indexOf(argument + " ") == 0) {
			results.push(current.substring(2,current.length));
		}
		//flags
		else if (current.indexOf(argument) == 0) {
			results.push(true);
		}
	}
	if (results.length == 0) return false;
	else if (argument == "g") return results;
	else return results[0];
}