{
  inputs = {
    nixpkgs.url = "nixpkgs/release-24.05";
    utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    haze,
    utils,
  }:
    utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {
        inherit system;
      };
    in rec {
      devShells.default = pkgs.mkShell {
        nativeBuildInputs = with pkgs; [
          nodejs
          typescript
          yarn
        ];
      };
    });
}
