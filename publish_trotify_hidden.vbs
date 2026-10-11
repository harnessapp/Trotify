Set shell = CreateObject("WScript.Shell")

command = "cmd.exe /c """"C:\trotify_dashboard\publish_trotify.bat"" >> ""C:\trotify_dashboard\publish_trotify_log.txt"" 2>&1"""

shell.Run command, 0, True