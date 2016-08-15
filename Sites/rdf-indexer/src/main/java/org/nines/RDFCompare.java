package org.nines;

import java.io.IOException;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.apache.log4j.xml.DOMConfigurator;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

/**
 * RDF Compare will perform comparisions on the target arcive and the main SOLR index.
 * 
 * @author loufoster
 *
 */
public class RDFCompare {

    private RDFIndexerConfig config;
    private boolean includesText = false;
    private Logger log;
    private Logger txtLog;
    private PrintStream sysOut;
    private LinkedHashMap<String, List<String>> errors = new LinkedHashMap<String, List<String>>();
    private int errorCount = 0;
    private int txtErrorCount = 0;
    private SolrClient solrClient;

    //  private static final ArrayList<String> LARGE_TEXT_ARCHIVES = new ArrayList<String>( Arrays.asList(
    //      "PQCh-EAF", "amdeveryday", "amdecj", "oldBailey" ));

    private static final ArrayList<String> REQUIRED_FIELDS = new ArrayList<String>(Arrays.asList("title_sort", "title",
        "genre", "archive", "url", "federation", "year_sort", "year_sort_asc", "year_sort_desc", "freeculture", "is_ocr"));
    private static final ArrayList<String> REQUIRED_PAGES_FIELDS = new ArrayList<String>(Arrays.asList("text", "page_num", "page_of"));

    /**
     * Construct an instance of the RDFCompare with the specified config
     * @param config
     * @throws IOException 
     */
    public RDFCompare(RDFIndexerConfig config) {
        this.config = config;
        String logFileRoot = this.config.getLogfileBaseName("");
        
        String compareLog = logFileRoot + "_compare.log";
        String skippedLog = logFileRoot + "_skipped.log";
        String compareTxtLog = logFileRoot + "_compare_text.log";

        System.setProperty("compare.log.file", compareLog);
        System.setProperty("compare.text.log.file", compareTxtLog);
        System.setProperty("skipped.log.file", skippedLog);
        URL url = ClassLoader.getSystemResource("log4j-compare.xml");
        DOMConfigurator.configure(url);

        // init logging
        this.log = Logger.getLogger("compare");
        this.txtLog = Logger.getLogger("compareTxt");

        // set up sys out so it can handle utf-8 output
        try {
            this.sysOut = new PrintStream(System.out, true, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            this.sysOut = null;
        }

        // init the solr connection
        this.solrClient = new SolrClient(this.config.solrBaseURL);
    }

    /**
     * Perform the comparison based on the config passed into the c'tor
     */
    public void compareArchive() {

        // log start time
        Date start = new Date();
        this.log.info("Started compare at " + start);
        logInfo("====== Scanning archive \"" + config.archiveName + "\" ====== ");

        // get the list of fields and determine if we are to include text
        String fl = config.getFieldList( );
System.out.println("~~~ ~~~~~~~~~~~~~~~ config getfieldlist::::::  " + fl);

        if( fl.contains( "text" ) == true ) includesText = true;
        if( fl.equals( "*" ) == true ) includesText = true;


        // Start at beginning of list and return 500 hits at a time
        int page = 0;
        int size = this.config.pageSize;
System.out.println("~~~###~~~~~~~~~~~~~~~ size pagesize ::::::  " + size);
        List<JsonObject> archiveDocs = new ArrayList<JsonObject>();
        HashMap<String, JsonObject> indexHash = new HashMap<String, JsonObject>();
        Set<String> indexUris = new HashSet<String>();
        Set<String> archiveUris = new HashSet<String>();
        String reindexCore = config.coreName( );

        // When fieldlist includes test, and the archive is one that contains
        // large text fields, limit page size to 1
        //    if ( this.includesText && LARGE_TEXT_ARCHIVES.contains(config.archiveName)) {
        //      size = 1;
        //    }

        // counts for text size
        int totalText = 0;
        int maxTextSize = 0;
        int docsWithText = 0;
        int maxText2 = 0;
        int maxText5 = 0;
        int maxText10 = 0;
        int maxText50 = 0;
        int maxText100 = 0;
        int maxText200 = 0;
        int maxText500 = 0;
        int maxText1000 = 0;
        int maxText2000 = 0;
        int maxText5000 = 0;
        int maxText10000 = 0;
        int runningText2 = 0;
        int runningText5 = 0;
        int runningText10 = 0;
        int runningText50 = 0;
        int runningText100 = 0;
        int runningText200 = 0;
        int runningText500 = 0;
        int runningText1000 = 0;
        int runningText2000 = 0;
        int runningText5000 = 0;
        int runningText10000 = 0;
        int count = 0;
        DecimalFormat df = new DecimalFormat();

        // read a page of docs back from index and archive. Compare the page hits.
        // If comparisons were complete, remove the docs from lists.
        // Repeat til all lists are gone.
        boolean archiveDone = false;
        boolean indexDone = false;
        while ( true ) {
            List<JsonObject> pageHits = null;
System.out.println("~~~ ~~~~~~~~~~~~~~~ config reindexCore::::::  " + reindexCore);
System.out.println("~~~ ~~~~~~~~~~~~~~~ config.archiveName::::::  " + config.archiveName);
System.out.println("~~~ ~~~~~~~~~~~~~~~ archiveDone ::::::  " + archiveDone );

System.out.println("~~~ ~~~~~~~~~~~~~~~ page ::::::  " + page);
System.out.println("~~~ ~~~~~~~~~~~~~~~ size ::::::  " + size);
System.out.println("~~~ ~~~~~~~~~~~~~~~ fl ::::::  " + fl);
            // get hits from archive, tally totals and check for end
            if ( archiveDone == false ) {
                pageHits = this.solrClient.getResultsPage( reindexCore, config.archiveName, page, size, fl, null, null );
System.out.println("~~~ ~~~~~~~~~~~~~~~ pageHits size ::::::  " + pageHits.size() );

                if (pageHits.size() < size) {
                    archiveDone = true;
                }

                // save off the set of uris for the archived docs
                for (JsonObject doc : pageHits) {
                    int thisSize = 0;
                    if (doc.has("text")) {
                        docsWithText++;
                        thisSize = doc.get("text").getAsString().length();
                        totalText += thisSize;
                        if (thisSize > maxTextSize)
                            maxTextSize = thisSize;
                    }
                    runningText2 += thisSize;
                    runningText5 += thisSize;
                    runningText10 += thisSize;
                    runningText50 += thisSize;
                    runningText100 += thisSize;
                    runningText200 += thisSize;
                    runningText500 += thisSize;
                    runningText1000 += thisSize;
                    runningText2000 += thisSize;
                    runningText5000 += thisSize;
                    runningText10000 += thisSize;
                    count++;
                    if (count % 2 == 0) {
                        if (runningText2 > maxText2)
                            maxText2 = runningText2;
                        runningText2 = 0;
                    }
                    if (count % 5 == 0) {
                        if (runningText5 > maxText5)
                            maxText5 = runningText5;
                        runningText5 = 0;
                    }
                    if (count % 10 == 0) {
                        if (runningText10 > maxText10)
                            maxText10 = runningText10;
                        runningText10 = 0;
                    }
                    if (count % 50 == 0) {
                        if (runningText50 > maxText50)
                            maxText50 = runningText50;
                        runningText50 = 0;
                    }
                    if (count % 100 == 0) {
                        if (runningText100 > maxText100)
                            maxText100 = runningText100;
                        runningText100 = 0;
                    }
                    if (count % 200 == 0) {
                        if (runningText200 > maxText200)
                            maxText200 = runningText200;
                        runningText200 = 0;
                    }
                    if (count % 500 == 0) {
                        if (runningText500 > maxText500)
                            maxText500 = runningText500;
                        runningText500 = 0;
                    }
                    if (count % 1000 == 0) {
                        if (runningText1000 > maxText1000)
                            maxText1000 = runningText1000;
                        runningText1000 = 0;
                    }
                    if (count % 2000 == 0) {
                        if (runningText2000 > maxText2000)
                            maxText2000 = runningText2000;
                        runningText2000 = 0;
                    }
                    if (count % 5000 == 0) {
                        if (runningText5000 > maxText5000)
                            maxText5000 = runningText5000;
                        runningText5000 = 0;
                    }
                    if (count % 10000 == 0) {
                        if (runningText10000 > maxText10000)
                            maxText10000 = runningText10000;
                        runningText10000 = 0;
                    }
                    archiveDocs.add(doc);
                    archiveUris.add(doc.get("uri").getAsString());
                }
            }

            // get index docs
            if ( indexDone == false) {
                String core = "resources";
                if ( this.config.isPagesArchive() ) {
                    core = "pages";
                }
                pageHits = this.solrClient.getResultsPage( core, config.archiveName, page, size, fl, null, null );

                if (pageHits.size() < size) {
                    indexDone = true;
                }

                // hash the indexed docs by uri to speed stuff up
                for (JsonObject doc : pageHits) {
                    String uri = doc.get("uri").getAsString();
                    indexHash.put(uri, doc);
                    indexUris.add(uri);
                }
            } 

            // compare. This will also remove processed docs from each
            compareLists(indexHash, archiveDocs);

            // next page?
            if ( archiveDone == true && indexDone == true ) {
                break;
            } else {
                page++;
            } 
        }
            
        if (runningText2 > maxText2)
            maxText2 = runningText2;
        if (runningText5 > maxText5)
            maxText5 = runningText5;
        if (runningText10 > maxText10)
            maxText10 = runningText10;
        if (runningText50 > maxText50)
            maxText50 = runningText50;
        if (runningText100 > maxText100)
            maxText100 = runningText100;
        if (runningText200 > maxText200)
            maxText200 = runningText200;
        if (runningText500 > maxText500)
            maxText500 = runningText500;
        if (runningText1000 > maxText1000)
            maxText1000 = runningText1000;
        if (runningText2000 > maxText2000)
            maxText2000 = runningText2000;
        if (runningText5000 > maxText5000)
            maxText5000 = runningText5000;
        if (runningText10000 > maxText10000)
            maxText10000 = runningText10000;

        // if there's stuff left in the archiveDocs, and we are looking at text, dump it
        if (archiveDocs.size() > 0 && this.includesText) {
            this.txtLog.info(" ============================= TEXT ADDED TO ARCHIVE ===========================");
            for (JsonObject doc : archiveDocs) {
                this.txtLog
                    .info("---------------------------------------------------------------------------------------------------------------");
                this.txtLog.info(" --- " + doc.get("uri").getAsString() + " ---");
                if (doc.has("text")) {
                    this.txtLog.info(doc.get("text").getAsString());
                    this.txtErrorCount++;
                }
            }
            this.txtLog
                .info("---------------------------------------------------------------------------------------------------------------");
        }

        // done log some stats
        this.log.info("Total Docs Scanned: " + archiveUris.size() + ". Total Errors: " + this.errorCount + ".");
        this.log.info("  retrieved " + archiveUris.size() + " new objects;");
        this.log.info("  retrieved " + indexUris.size() + " old objects;");
        if (this.includesText) {
            this.txtLog.info("Total Docs Scanned: " + archiveUris.size() + ". Total Errors: " + this.txtErrorCount
                + ".");
        }
        this.txtLog.info("Largest Text Size: " + df.format(maxTextSize) + ".");
        this.txtLog.info("Number of Docs with Text: " + df.format(docsWithText) + ".");
        this.txtLog.info("Total Text Size: " + df.format(totalText) + ".");
        this.txtLog.info("Running Text Sizes:\n2=" + df.format(maxText2) + "\n5=" + df.format(maxText5) + "\n10="
            + df.format(maxText10) + "\n50=" + df.format(maxText50) + "\n100=" + df.format(maxText100) + "\n200="
            + df.format(maxText200) + "\n500=" + df.format(maxText500) + "\n1000=" + df.format(maxText1000) + "\n2000="
            + df.format(maxText2000) + "\n5000=" + df.format(maxText5000) + "\n10000=" + df.format(maxText10000));

        Date end = new Date();
        double durationSec = (end.getTime() - start.getTime()) / 1000.0;
        if (durationSec >= 60) {
            logInfo(String.format("JAVA Finished in %3.2f minutes.", (durationSec / 60.0)));
        } else {
            logInfo(String.format("JAVA Finished in %3.2f seconds.", durationSec));
        }

        // now check for skipped stuff
        doSkippedTest(indexUris, archiveUris);
    }

    private void logErrors() {
        for (Map.Entry<String, List<String>> entry : this.errors.entrySet()) {
            String uri = entry.getKey();
            if (uri.equals("txt")) {
                for (String msg : entry.getValue()) {
                    logInfo(msg);
                }
            } else {
                logInfo("---" + uri + "---");
                for (String msg : entry.getValue()) {
                    logInfo("    " + msg);
                }
            }
        }
        this.errors.clear();
    }

    /**
     * Compare the set of URIs in the index ad archive. List out all new documents and
     * all old. Show a skipped count (skipped is a doc in the original index, but not 
     * the archive 
     * @param indexUris Set uf URIs from the main index
     * @param archiveUris List of SolrDocuments in the index
     */
    private void doSkippedTest(Set<String> indexUris, Set<String> archiveUris) {

        // set up logger just for skipped files
        Logger skippedLog = Logger.getLogger("skipped");

        Date started = new Date();
        skippedLog.info("Started: " + started);
        skippedLog.info("====== Scanning archive \"" + config.archiveName + "\" ====== ");
        skippedLog.info("retrieved " + archiveUris.size() + " new objects;");
        skippedLog.info("retrieved " + indexUris.size() + " old objects;");

        Set<String> oldOnly = new HashSet<String>(indexUris);
        oldOnly.removeAll(archiveUris);
        archiveUris.removeAll(indexUris);
        for (String uri : oldOnly) {
            skippedLog.info("    Old: " + uri);
        }
        for (String uri : archiveUris) {
            skippedLog.info("    New: " + uri);
        }

        skippedLog.info("Total not indexed: " + oldOnly.size() + ". Total new: " + archiveUris.size() + ".");
    }

    /**
     * Scan thru each document in the archive and find differences 
     * @param indexHash List of all original docs in the index
     * @param archiveDocs List of docs in the reindexed archive
     * @throws Exception
     */
    private void compareLists(HashMap<String, JsonObject> indexHash, List<JsonObject> archiveDocs) {

        // Run thru al items in new archive. Validate correct data
        // and compare against object in original index if possible
        Iterator<JsonObject> itr = archiveDocs.iterator();
        while (itr.hasNext()) {

            // look up the corresponding object in the original index
            JsonObject doc = itr.next();
            String uri = doc.get("uri").getAsString();
            JsonObject indexDoc = indexHash.get(uri);

            // If we have matches do the work
            if (indexDoc != null) {
                // On full compares, validaate all required
                // fields are present and contain content
                if (this.config.ignoreFields.length() == 0 && this.config.includeFields.equals("*")) {
                    validateRequiredFields(doc);
                }

                // comapre all fields
                try {
                    compareFields(uri, indexDoc, doc);
                } catch (Exception e) {
                    addError(uri, "Threw exception during compareFields: "+e.toString() );
                    StringWriter sw = new StringWriter();
                    e.printStackTrace( new PrintWriter(sw) );
                    addError(uri, "Stack Trace:\n\n"+sw.toString());
                }

                // dump results
                logErrors();

                // done with them
                indexHash.remove(uri);
                itr.remove();
            }
        }
    }

    /**
     * Walk through each field in the new doc and compare it with the
     * old. Log any differences. 
     * @param uri
     * @param indexDoc
     * @param doc
     */
    private void compareFields(String uri, JsonObject indexDoc, JsonObject doc) {

        // loop over all keys in doc
        for (Entry<String, JsonElement> entry : doc.entrySet()) {

            // get key and do special handing for text fields
            String key = entry.getKey();
            if (key.equals("text")) {
                compareText(uri, indexDoc, doc);
                continue;
            }

            // grab new val
            String newVal = toSolrString(entry.getValue());

            // is this a new key?
            if (indexDoc.has(key) == false) {
                if (isIgnoredNewField(key) == false) {
                    addError(uri, key + " " + newVal.replaceAll("\n", " / ") + " introduced in reindexing.");
                }
                continue;
            }

            // get parallel val in indexDoc
            String oldVal = toSolrString(indexDoc.get(key));

            // dump the key from indexDoc so we can detect
            // unindexed values later
            indexDoc.remove(key);

            // don't compare score or indexing dates.
            if (key.equals("score") || key.equals("date_updated") || key.equals("date_created") || key.equals("_version_") ) {
                continue;
            }

            // difference?
            if (newVal.equals(oldVal) == false) {

                // make sure everything is escaped and check again.
                String escapedOrig = getProcessedOrigField(oldVal);
                String escapedNew = getProcessedReindexedField(newVal);
                if (escapedNew.equals(escapedOrig) == false) {

                    // too long to dump in a single error line?
                    if (oldVal.length() > 30) {

                        // log a summary
                        addError(uri,
                            key + " mismatched: length= " + newVal.length() + " (new)" + " vs. " + oldVal.length()
                                + " (old)", true);

                        // then find first diff and log it
                        String[] oldArray = oldVal.split("\n");
                        String[] newArray = newVal.split("\n");
                        for (int i = 0; i <= oldArray.length; i++) {
                            if (oldArray[i].equals(newArray[i]) == false) {

                                addError(uri,
                                    "        at line " + i + ":\n" + "\"" + newArray[i].replaceAll("\n", " / ")
                                        + "\" vs.\n" + "\"" + oldArray[i].replaceAll("\n", " / ") + "\"", true);
                                break;
                            }
                        }

                    } else {

                        // dump the entire diff to the log
                        addError(uri, key + " mismatched: \"" + newVal.replaceAll("\n", " / ") + "\" (new)" + " vs. \""
                            + oldVal.replaceAll("\n", " / ") + "\" (old)");
                    }

                }
            }
        }

        // now see if there are any leftover fields in indexDoc
        // log them is not reindexed
        for (Entry<String, JsonElement> entry : indexDoc.entrySet()) {
            String val = toSolrString(entry.getValue());
            String key = entry.getKey();
			if (isIgnoredOldField(key) == false) {
            	if (val.length() > 100) {
                	val = val.substring(0, 100);
            	}
            	addError(uri, "Key not reindexed: " + key + "=" + val, true);
			}
        }
    }

    /**
     * Convert an Entry contaning solr data to a string
     * @param obj
     * @return The string data represented by the object
     */
    private final String toSolrString(final JsonElement obj) {
        if (obj.isJsonArray()) {

            JsonArray jsonArray = (JsonArray) obj;
            Iterator<JsonElement> itr = jsonArray.iterator();
            StringBuilder out = new StringBuilder();
            while (itr.hasNext()) {
                if (out.length() > 0) {
                    out.append(" | ");
                }
                out.append(itr.next().getAsString());
            }
            return out.toString();
        }
        return obj.getAsString();
    }

    /**
     * Compare just the TEXT field of the index and archive docs
     * @param uri
     * @param indexDoc
     * @param doc
     */
    private void compareText(String uri, JsonObject indexDoc, JsonObject doc) {

        String newTxt = null;
        if (doc.has("text")) {
            newTxt = doc.get("text").getAsString();
        }
        String oldTxt = null;
        if (indexDoc.has("text")) {
            oldTxt = indexDoc.get("text").getAsString();
            indexDoc.remove("text");
        }

        // log additional errors if no new text and doc is flagged
        // such that it must have text (ocr or full text)
        boolean compareTexts = true;
        if ( this.config.isPagesArchive() ) {
            if (newTxt == null ) {
                this.txtLog.error(uri + ": is page data, but is missing page text in the new index.");
                this.txtErrorCount++;
                compareTexts = false;
            } 
            if ( oldTxt == null ) {
                this.txtLog.error(uri + ": is page data, but is missing page text in the pages core.");
                this.txtErrorCount++;
                compareTexts = false;
            }
        } else {
            if (newTxt == null) {
                String val = doc.get("has_full_text").toString();
                if (val.equalsIgnoreCase("false")) {
                    this.txtLog.error(uri + ": field has_full_text is " + val + " but full text does not exist.");
                    this.txtErrorCount++;
                    compareTexts = false;
                }
    
                val = doc.get("is_ocr").toString();
                if (val.equalsIgnoreCase("false")) {
                    this.txtLog.error(uri + ": field is_ocr is " + val + " but full text does not exist.");
                    this.txtErrorCount++;
                    compareTexts = false;
                }
            }
    
            if (newTxt == null && oldTxt != null) {
                this.txtLog.error(uri + ":text field has disappeared from the new index. (old text size = "
                    + oldTxt.length());
                this.txtErrorCount++;
                compareTexts = false;
            } else if (newTxt != null && oldTxt == null) {
                this.txtLog.error(uri + ":text field has appeared in the new index.");
                this.txtErrorCount++;
                compareTexts = false;
            }
        }
        
        if ( compareTexts ) {
            if (newTxt.equals(oldTxt) == false) {
            
                newTxt = getProcessedReindexedText(newTxt);
                oldTxt = getProcessedOrigText(oldTxt);
    
                if (oldTxt.equals(newTxt) == false) {
                    logMismatchedText(uri, oldTxt, newTxt);
                }
            }
        }
    }

    private void logMismatchedText(final String uri, final String oldTxt, final String newTxt) {
        int pos = StringUtils.indexOfDifference(newTxt, oldTxt);
        pos = Math.max(0, pos - 4);
        String newSub = newTxt.substring(pos, Math.min(pos + 51, newTxt.length()));
        String oldSub = oldTxt.substring(pos, Math.min(pos + 51, oldTxt.length()));
        this.txtLog.error("==== " + uri + " mismatch at line 0 col " + pos + ":");
        this.txtLog.error("(new " + newTxt.length() + ")");
        this.txtLog.error(newSub);
        this.txtLog.error("-- vs --");
        this.txtLog.error("(old " + oldTxt.length() + ")");
        this.txtLog.error(oldSub);
        this.txtLog.error("NEW: " + getBytesString(newSub));
        this.txtLog.error("OLD: " + getBytesString(oldSub));
        this.txtErrorCount++;
    }

    private String getBytesString(String text) {
        try {
            byte[] bytes = text.getBytes("UTF-8");
            StringBuffer hexStr = new StringBuffer();
            for (int i = 0; i < bytes.length; i++) {
                hexStr.append(Integer.toString(0xFF & bytes[i])).append(" ");
                if (hexStr.length() > 45)
                    break;
            }
            return hexStr.toString();
        } catch (Exception e) {
            addError("txt", "Invalid bytes in text: " + e.getMessage());
            return "** ERROR **";
        }
    }

    private String getProcessedOrigField(String origVal) {
        return removeExtraWhiteSpace(origVal);
    }

    private String getProcessedReindexedField(String origVal) {
        return removeExtraWhiteSpace(origVal);
    }

    private String getProcessedOrigText(String origTxt) {
        String val = origTxt.replaceAll("““", "“");
        val = val.replaceAll("””", "””");
        val = val.replaceAll("††", "†");
        val = val.replaceAll("\\—+", "—");
        return removeExtraWhiteSpace(val);
    }

    private String getProcessedReindexedText(String srcTxt) {
        String val = srcTxt.replaceAll("““", "“");
        val = val.replaceAll("””", "””");
        val = val.replaceAll("††", "†");
        val = val.replaceAll("\\—+", "—");
        return removeExtraWhiteSpace(val);
    }

    private String removeExtraWhiteSpace(final String srcTxt) {
        String result = srcTxt.replaceAll("\t", " "); // change tabs to spaces
        result = result.replaceAll("\\s+", " "); // get rid of multiple spaces
        result = result.replaceAll(" \n", "\n"); // get rid of trailing spaces
        result = result.replaceAll("\n ", "\n"); // get rid of leading spaces
        result = result.replaceAll("\\n+", " "); // get rid of lines
        return result;
    }

    /**
     * EXCEPTION case. Dont whine about fields we know are newly added
     * @param key
     * @return
     */
    private boolean isIgnoredNewField(String key) {
        if (key.equals("date_created") || key.equals("date_updated")) {
            return true;
        }
        return false;
    }

    private boolean isIgnoredOldField(String key) {
        if (key.equals("batch")) {
            return true;
        }
        return false;
    }

    private void addError(String uri, String err) {
        addError(uri, err, false);
    }

    private void addError(String uri, String err, boolean tail) {
        if (this.errors.containsKey(uri) == false) {
            this.errors.put(uri, new ArrayList<String>());
        }

        if (uri.equals("txt") || tail) {
            this.errors.get(uri).add(err);
        } else {
            this.errors.get(uri).add(0, err);
        }

        if (uri.equals("txt") == false) {
            this.errorCount++;
        }
    }

    /**
     * Ensure that all required fields are present and contain data
     * @param doc Document XML data
     * @throws Exception
     */
    private void validateRequiredFields(JsonObject doc) {

        ArrayList<String> reqFields = REQUIRED_FIELDS;
        if ( this.config.isPagesArchive()) {
            reqFields = REQUIRED_PAGES_FIELDS;
        }
        for (String fieldName : reqFields ) {

            // find the first element in the correct doc that
            // has a name attribute matching the  required field
            String uri = doc.get("uri").getAsString();
            Object docField = doc.get(fieldName);

            // make sure field is present
            if (docField == null) {

                addError(uri, "required field: " + fieldName + " missing in new index");

            } else {

                // if its an array, make sure it has children
                // and that the concatenated children content has length
                if (docField instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<String> list = (List<String>) docField;
                    String val = "";
                    for (String data : list) {
                        val += data;
                    }
                    if (val.length() == 0) {
                        addError(uri, "required ARR field: " + fieldName + " is all spaces in new index");
                    }
                } else {
                    if (docField.toString().trim().length() == 0) {
                        addError(uri, "required STR field: " + fieldName + " is all spaces in new index");
                    }
                }
            }
        }
    }

    /**
     * Log data to file and System.out
     * @param msg
     */
    private void logInfo(final String msg) {
        log.info(msg);
        if (this.sysOut != null) {
            this.sysOut.println(msg);
        } else {
            System.out.println(msg);
        }

    }
}
