package dealjson;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;

public class dealjson {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
	    File file = new File("C:/Users/IBM_ADMIN/Desktop/新建文件夹/CDW_Printers.txt");
	    BufferedReader reader = null;
	    String tempString = null;
//	    Set<String> set = new HashSet<String>();
	    ArrayList<String> content = new ArrayList<>();
	//Read a text file
	    try {
	        reader = new BufferedReader(new FileReader(file));
	        while ((tempString = reader.readLine()) != null) {
	        	if(tempString.indexOf(":\"\"") > -1) {
	        		continue;
	        	}else{
	            content.add(tempString);
	            }
	        	
//	            set.add(tempString);
	        }
	        reader.close();

	    } catch (FileNotFoundException e) {
	        // TODO Auto-generated catch block
	        e.printStackTrace();
	    } catch (IOException e) {
	        // TODO Auto-generated catch block
	        e.printStackTrace();
	    }finally{
	        if(reader != null){
	            try {
	                reader.close();
	            } catch (IOException e) {
	                // TODO Auto-generated catch block
	                e.printStackTrace();
	            }
	        }
	    }
	    try{
	        BufferedWriter writer = new BufferedWriter(new FileWriter(new File("C:/Users/IBM_ADMIN/Desktop/新建文件夹 (2)/Printers_results.txt")));
	        Iterator<String> it = content.iterator();
	        while(it.hasNext()){
	        String a = String.valueOf(it.next()+ "\n");
//	        System.out.print(a);
	        writer.write(a);
	    }
	        writer.close();
	    }catch(Exception e){

	    }

	}

}
