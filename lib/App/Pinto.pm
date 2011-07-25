package App::Pinto;

# ABSTRACT: Command-line driver for Pinto

use strict;
use warnings;

use App::Cmd::Setup -app;

#------------------------------------------------------------------------------

# VERSION

#------------------------------------------------------------------------------

sub global_opt_spec {
  return (
    [ "verbose"   => "Log additional output" ],
    [ "local=s"   => "Path to local repository directory"],
    [ "profile=s" => "Path to your pinto profile" ],
  );
}

#------------------------------------------------------------------------------

sub usage_desc {
    return '%c [global options] <command>';
}

#------------------------------------------------------------------------------

sub pinto {
    my ($self) = @_;

    require Pinto;
    require Pinto::Config;

    return $self->{pinto} ||= do {
        my %global_options = %{ $self->global_options() };
        my $config = Pinto::Config->new(%global_options);
        my $pinto = Pinto->new(config => $config);
    };
}

#------------------------------------------------------------------------------

1;

__END__

=pod

=head1 DESCRIPTION

There is nothing to see here.  You probably should look at the
documentation for L<pinto> instead.

=cut
