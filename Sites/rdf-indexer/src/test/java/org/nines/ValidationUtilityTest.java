/** 
 *  Copyright 2011 Applied Research in Patacriticism and the University of Virginia
 * 
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 **/
package org.nines;

import junit.framework.TestCase;

import java.util.ArrayList;
import java.util.HashMap;

public class ValidationUtilityTest extends TestCase {
 
  protected void setUp() throws Exception {
    super.setUp();
  }
  
  public void testGenre() {
    
    for (String g : ValidationUtility.GENRE_LIST ) {
      assertTrue(ValidationUtility.validateGenreInList(g));
    }
    assertFalse(ValidationUtility.validateGenreInList("asdf"));
  }

  public void testValidateRequired() {
    // "archive","title","agent","genre","date_label"
    HashMap<String, ArrayList<String>> testMap = new HashMap<String, ArrayList<String>>();

    ArrayList<String> genreVals = new ArrayList<String>();
    testMap.put("genre", genreVals);
    testMap.put("archive", genreVals);
    testMap.put("year", genreVals);

    ArrayList<String> messages = ValidationUtility.validateRequired(testMap);

    assertEquals(7, messages.size());

    testMap.put("title", genreVals);
    testMap.put("role_AUT", genreVals);
    testMap.put("freeculture", genreVals);
    testMap.put("has_full_text", genreVals);
    testMap.put("is_ocr", genreVals);
    testMap.put("federation", genreVals);
    testMap.put("url", genreVals);

    messages = ValidationUtility.validateRequired(testMap);

    assertEquals(0, messages.size());
  }

  public void testValidateFreeCulture() {
    assertTrue(ValidationUtility.validateFreeculture("true"));
    assertTrue(ValidationUtility.validateFreeculture("false"));
    assertTrue(ValidationUtility.validateFreeculture(null));
    assertFalse(ValidationUtility.validateFreeculture("yes"));
  }

  public void testValidateRole() {
    HashMap<String, ArrayList<String>> object = new HashMap<String, ArrayList<String>>();
    // ART, AUT, EDT, PBL, and TRL are all we currently support
    object.put("role_ART", null);
    object.put("role_AUT", null);
    object.put("role_EDT", null);
    object.put("role_PBL", null);
    object.put("role_TRL", null);
    object.put("something_else", null);

    assertEquals(0, ValidationUtility.validateRole(object).size());

    object.put("role_XXX", null);
    assertEquals(1, ValidationUtility.validateRole(object).size());

  }
}
