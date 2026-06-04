on adding folder items to this_folder after receiving added_items
	set scriptPath to "/Users/itouyasuhito/Documents/チームアイコン/Scripts/png-in-to-webp-out.sh"
	set shellCommand to quoted form of scriptPath
	repeat with addedItem in added_items
		set shellCommand to shellCommand & " " & quoted form of POSIX path of addedItem
	end repeat
	try
		do shell script shellCommand
	on error errorMessage
		display notification errorMessage with title "WebP変換エラー"
	end try
end adding folder items to
