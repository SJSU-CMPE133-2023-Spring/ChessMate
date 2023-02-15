import java.io.*;
import java.util.Scanner;

public class testRuntime {
        public static void main(String[] args) {
            try {

                // print a message
                System.out.println("Executing notepad.exe");

                // create a process and execute notepad.exe
                ProcessBuilder pb = new ProcessBuilder("C:\\chessProject\\stockfish_15.1_win_x64_avx2\\stockfish-windows-2022-x86-64-avx2.exe");

                pb.redirectInput(ProcessBuilder.Redirect.INHERIT);
                pb.redirectOutput(ProcessBuilder.Redirect.INHERIT);
                pb.redirectError(ProcessBuilder.Redirect.INHERIT);
                Process p = pb.start();


                /*
                Alternative to redirection:
                OutputStream stdin = p.getOutputStream ();
                InputStream stderr = p.getErrorStream ();
                InputStream stdout = p.getInputStream ();
                BufferedReader reader = new BufferedReader(new InputStreamReader(stdout));
                BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(stdin));
                 */



                Scanner scan = new Scanner(System.in);
                String line;

                while (scan.hasNext()) {
                    String input = scan.nextLine();

                    /* Alternative to redirection
                    if (input.trim().equals("exit")) {
                        // Putting 'exit' amongst the echo --EOF--s below doesn't work.
                        writer.write("exit\n");
                    } else {
                        writer.write(input+"\n");
                    }
                    writer.flush();


                    line = reader.readLine();
                    while (line != null) {
                        System.out.println ("Stdout: " + line);
                        line = reader.readLine();
                    }*/
                }



            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
    }

