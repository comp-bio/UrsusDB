import sys


def echo(txt, col=31):
    sys.stdout.write(f"\033[1;{col}m{txt}\033[0;0m")


available = ['loader', 'server', 'test', 'header', 'import']
if len(sys.argv) < 2 or sys.argv[1] not in available:
    echo("ERROR:\n  Command not found!\n")
    echo("Usage:\n", 37)
    for cmd in available:
        echo(f"  ./{sys.argv[0]} {cmd}\n", 37)
    sys.exit(1)

__import__(f"application.tools.{sys.argv[1]}", fromlist=['']).main()
