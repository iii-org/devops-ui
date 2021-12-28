#!/usr/bin/perl
$key = 'API_URL=';
$cmd_msg = `env | grep $key`;
$cmd_msg =~ s/\n|\r//g;
if ($cmd_msg ne '') {
	($t1, $api_url) = split(/=/,$cmd_msg);
	if ($t1.'=' ne $key) {
		print("Error! [$cmd_msg] key:[$t1] <> [$key]\n");
		sleep(3);
		exit;
	}
	print("API_URL : [$api_url]\n");

	$file = '/etc/nginx/conf.d/default.conf';
	$tmpl = `cat $file.tmpl`;
	$tmpl =~ s/%%api_url%%/$api_url/g;
	open(FH, '>', $file) or die $!;
	print FH $tmpl;
	close(FH);
	
	$cmd_msg = `cat $file`;
	print("\n-----\n$cmd_msg\n-----\n");
}

system("nginx -g \"daemon off;\"");
